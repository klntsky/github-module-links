# github-module-links

This userscript inserts direct repository links for modules used in source code on github. Currently only JS & npm are supported.

![Preview](preview.png)

Repo URLs are being fetched from [npmjs registry](https://registry.npmjs.org/). Relative imports are also linkified.

Check the source code for configurable options.

# Installing

Follow the [userscript installation instructions](https://github.com/OpenUserJs/OpenUserJS.org/wiki/Userscript-Beginners-HOWTO#how-do-i-get-going).

The file is located [here](https://raw.githubusercontent.com/8084/github-module-links/master/build/github-module-links.user.js).


# TODO

- DONE ~~find more elegant way to listen for page content changes than `setInterval` with checker function (defeat that ugly AJAX navigation)~~
- DONE ~~add support for `import something from 'some-module'` notation~~
- DONE ~~replace system modules with links to their sources instead of [security-holder](https://github.com/npm/security-holder/) module~~
- process repository URLs more carefully (consider rare cases when `repository.type` is not `git`, etc.)
- consider adding more programming languages and package registries
- add links to the main files of the modules instead of the repositories

# Links

- [Github](https://github.com/8084/github-module-links)
- [OpenUserJS](https://openuserjs.org/scripts/8084/Github_module_links)
- [Greasyfork](https://greasyfork.org/en/scripts/36484-github-module-links)