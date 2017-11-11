// ==UserScript==
// @name        github-js-module-links
// @namespace   github-js-module-links
// @version     1.0.0
// @author      klntsky
// @run-at      document-end
// @include     https://github.com/*
// @include     http://github.com/*
// @grant       GM_xmlhttpRequest
// @connect     registry.npmjs.org
// ==/UserScript==

var config = {
    // Whether to add `target='_blank'` to all of the links inserted
    open_new_tabs: true,
    // Mapping from package names to registry URLs
    registry: (package) => 'https://registry.npmjs.org/' + package,
    // Mapping from package names to package URLs (used as fallback)
    package_url: (package, repository) => 'https://www.npmjs.com/package/' + package,
    // Insert direct github repository links (i.e. if repository link returned
    // by npm API points to github.com, then use it instead of a link returned
    // by config.package_url lambda.
    // Most of the npm package repositories are hosted on github.
    github_repos: true,
    // Whether to allow logging
    log: false,
}


function update () {
    processImports(getImports());
}

function startUpdateTick () {
    var lastLocation = document.location.href;
    setInterval(() => {
        if (lastLocation !== document.location.href) {
            lastLocation = document.location.href;
            update();
            setTimeout(update, 1000);
        }
    }, 1000);
}

function log () {
    if (config.log)
        console.log.apply(console, arguments);
}

// Get object with package or file names as keys and lists of HTML elements as
// values. If the imports are already processed this function will not return
// them.
function getImports () {
    var imports = {};

    document.querySelectorAll('.js-file-line > span.pl-c1').forEach(el => {
        try {
            var s = el.nextSibling.nextSibling;
            if (el.textContent === 'require'
                && el.nextSibling.nodeType === 3
                && el.nextSibling.textContent.trim() === '('
                && s.classList.contains('pl-s')
                && s.nextSibling.nodeType === 3
                && s.nextSibling.textContent.trim().startsWith(')')) {
                var name = s.textContent.substr(1, s.textContent.length - 2);

                if (!name) return;
                if (imports[name] instanceof Array) {
                    imports[name].push(s);
                } else {
                    imports[name] = [s];
                }
            }
        } catch (e) {
        }
    });
    return imports;
}

// Add relative links for file imports and call processPackage for each package
// import.
function processImports (imports) {
    var packages = [];
    log('prcessImports', imports);
    for (var imp in imports) {
        if (imports.hasOwnProperty(imp)) {
            // If path is not relative
            if (imp[0] !== '.') {
                packages.push(imp);
            } else {
                imports[imp].forEach(elem => {
                    // Assume the extension is omitted
                    if (!imp.endsWith('.js')) {
                        imp += '.js';
                    }
                    addLink(elem, imp);
                });
            }
        }
    }

    log('processImports', 'packages:', packages);
    packages.forEach(p => processPackage(p, imports));
}

function processPackage (package, imports) {
    new Promise((resolve, reject) => GM_xmlhttpRequest({
        url: config.registry(package),
        timeout: 10000,
        method: 'GET',
        onload: r => {
            try {
                resolve(JSON.parse(r.response));
            } catch (e) {
                reject();
            }
        },
        onabort: reject,
        onerror: reject,
    })).then(response => {
        try {
            // `new URL(response.repository.url)` incorrectly handles
            // `git+https` protocol.
            var url = response.repository.url.split('/')
            if (url.length >= 5) {
                var hostname = url[2];
                var username = url[3];
                var repo = url[4];

                if (repo.endsWith('.git') && url.length == 5) {
                    repo = repo.substr(0, repo.length - 4);
                }

                if (hostname == 'github.com' && config.github_repos) {
                    imports[package].forEach(elem => {
                        addLink(elem, 'https://github.com/' + username + '/' +
                                      repo + '/');
                    });
                } else {
                    addLink(elem, config.package_url(package, response.repository.url));
                }
            }
        } catch (e) {
            log('processPackage', 'error:', e);
        }
    });
}

function addLink (elem, url) {
    var a = document.createElement('a');
    a.href = url;

    if (config.open_new_tabs) {
        a.target="_blank";
    }

    elem.parentNode.insertBefore(a, elem);
    a.appendChild(elem);
}

update();
startUpdateTick();
