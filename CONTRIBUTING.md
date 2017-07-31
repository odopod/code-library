# Contributing to Odo

Want to contribute to Odo? Great! If you're new to contributing to contributing to open source, please check out [GitHub's guide for contributing to open source](https://guides.github.com/activities/contributing-to-open-source/index.html).

## Issues
If you find a bug in the source code or a mistake in the documentation, you can help us by submitting an issue. Please check existing issues first for your issue by searching the open and closed issues. Providing the following information will increase the chances of your issue being dealt with quickly:

* **Overview of the Issue** - if an error is being thrown a non-minified stack trace helps
* **Motivation for or Use Case** - explain why this is a bug for you
* **Browsers and Operating System** - is this a problem with all browsers or only a specific one?
* **Reproduce the Error** - provide a [reduced test case](https://css-tricks.com/reduced-test-cases/) (using [JS Bin](https://jsbin.com), [JSFiddle](https://jsfiddle.net/), or [CodePen](http://codepen.io/)) or a unambiguous set of steps.
* **Related Issues** - has a similar issue been reported before?
* **Paste error output** or logs in your issue or in a Gist. If pasting them in the issue, wrap it in three backticks so that it renders nicely.
* **Suggest a Fix** - if you can't fix the bug yourself, perhaps you can point to what might be causing the problem (line of code or commit)

If your issue does not contain sufficient information, it may be closed.

## Developing

### Setup

[Install `yarn`](https://yarnpkg.com/docs/install).

```sh
$ git clone https://github.com/odopod/code-library.git odo
$ cd odo
$ yarn run setup # Grab a coffee
```

Running the `setup` script will `yarn link` _explicit_ local dependencies for each package. It then will install the dependencies for each package and run the `test` script which compiles the package and runs its tests.

### Package Tasks

Once the dependencies are installed, `cd` into the component directory you want to work on. There are a few gulp tasks available to you:

| Task         | Description |
|--------------|-------------|
| `watch`      | Watch source and demo files |
| `watch-test` | Watch all files and re-run tests on change |
| `build`      | Compile source and demo files |
| `test`       | Compile tests, run them, and gather code coverage |
| `all`        | Compile everything and test |

You can also run these gulp tasks from the root directory if you supply an argument. For example, to build the carousel, you can `gulp build --project odo-carousel` or even `gulp build -p carousel`.

### Project Tasks

Scripts available in the main `package.json`.

| Task         | Description |
|--------------|-------------|
| `build-test-all` | Run `default` `gulp` task in each package. |
| `docs` | Generate docs files |
| `setup` | Link all odo dependencies, install all dependencies, and `build-test-all` |
| `test` | Run `yarn test` in every package |

There are others, but they're mostly used within the ones above.

## Pull Requests

If you’re able to patch the bug or add the feature yourself – fantastic, make a pull request with the code! We mostly follow [Airbnb's JavaScript style guide](https://github.com/airbnb/javascript). The linter will tell you if you're not conforming.

* Make your changes in a new git branch:

    ```shell
    git checkout -b my-fix-branch master
    ```

* Create your patch, **including appropriate test cases**.
* If you're adding a feature, make sure to update the **documentation/demos**.
* Build your changes locally to ensure all the tests pass:

    ```shell
    gulp
    ```

* Push your branch to GitHub:

    ```shell
    git push origin my-fix-branch
    ```

* In GitHub, send a pull request to the `master` branch.
* If we suggest changes then:
  * Make the required updates.
  * Re-run the tests to ensure they are still passing.
  * Rebase your branch and force push to your GitHub repository (this will update your Pull Request):

    ```shell
    git rebase master -i
    git push -f
    ```

That's it! Thank you for your contribution!

#### After your pull request is merged

After your pull request is merged, you can safely delete your branch and pull the changes
from the main (upstream) repository:

* Delete the remote branch on GitHub either through the GitHub web UI or your local shell as follows:

    ```shell
    git push origin --delete my-fix-branch
    ```

* Check out the master branch:

    ```shell
    git checkout master -f
    ```

* Delete the local branch:

    ```shell
    git branch -D my-fix-branch
    ```

* Update your master with the latest upstream version:

    ```shell
    git pull --ff upstream master
    ```
## Publishing a new release

* Make sure the build is still passing.
  * If you're working locally, make sure you run the tests from within your component `yarn test`. To be extra sure you didn't break anything, you can run all the tests from the root directory with `yarn test`.
  * When reviewing pull requests, Travis CI will run all the tests. Wait for it to complete then you can merge.
* Make sure the documentation is up to date. Make any updates to code examples or copy.
* Update the `version` field in the `package.json` for the component you're publishing.
* `yarn run docs` from the root.
* Commit these changes and tag the commit `odo-{component-name}-v{version}`.
* Push the commit and tag.
* `npm publish` from within the component directory you're publishing.
* Add release notes on GitHub for your new tag.
