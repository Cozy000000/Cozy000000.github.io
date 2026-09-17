# Zhiyi Chen · Personal website

A Jekyll academic homepage for [Zhiyi Chen](https://cozy000000.github.io), with warm paper colors, serif typography, responsive layouts, a section index, and light/dark themes.

## Run locally with Conda

Create the environment once:

```bash
conda env create -f environment.yml
conda activate cozy-site
gem install bundler -v 2.2.19
bash run_server.sh
```

The `cozy-site` environment includes Ruby 3.1 and the compilers needed for Jekyll's native dependencies. Ruby gems are installed in the ignored `vendor/bundle` directory. If `cozy-site` already exists, activate it and run the server directly.

Open <http://127.0.0.1:4000/>. The server rebuilds changes and refreshes the page. Configuration changes in `_config.yml` require restarting the server.

If Bundler reports an unsupported platform on another machine, run `bundle _2.2.19_ lock --add-platform "$(ruby -e 'print Gem::Platform.local')"` inside the environment before starting it.

To build without starting a server:

```bash
conda activate cozy-site
bundle _2.2.19_ exec jekyll build
```

## Edit content

| File | Content |
| --- | --- |
| `_config.yml` | Name, portrait, contact links, site URL, and metadata |
| `_pages/about.md` | Introduction, news, activities, and homepage layout |
| `_data/profile.yml` | Publications, BibTeX, education, and awards |
| `_data/navigation.yml` | Homepage section index |
| `_posts/` | Published blog posts with Jekyll front matter |
| `_pages/drawing.md` | Embedded research diagram |
| `assets/css/portfolio.css` | Colors, typography, and responsive layouts |
| `assets/js/portfolio.js` | Theme, navigation, citation copying, and visitor map |

The existing commented blog draft remains unpublished. Citations can be read without JavaScript; the copy button appears when the browser supports the Clipboard API. The visitor map loads only when its section is expanded.

## GitHub Pages

The site retains its existing Jekyll structure and produces static output in `_site/`. Commit source files and use the repository's GitHub Pages configuration to publish; dependencies, local caches, and generated output are not committed.

## Acknowledgments

- Visual direction inspired by [Xiang Liu's homepage](https://github.com/Dominic789654/Dominic789654.github.io): warm paper colors, editorial typography, and section navigation. The implementation here uses Jekyll and this site's own content.
- Originally based on [AcadHomepage](https://github.com/RayeRen/acad-homepage.github.io), with the original MIT license preserved in `LICENSE`.
- Legacy theme assets include Minimal Mistakes, AcademicPages, and Font Awesome under their original licenses.
