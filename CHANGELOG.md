# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.0] - 2025-05-27

### Changed
- Update dependency major version. If you are updating to this major version, make sure to update the following apps (if you have then installed) to the following major versions:
    - vtex.b2b-admin-customers@1.x
    - vtex.b2b-checkout-settings@2.x
    - vtex.b2b-my-account@1.x
    - vtex.b2b-orders-history@1.x
    - vtex.b2b-organizations@2.x
    - vtex.b2b-organizations-graphql@1.x
    - vtex.b2b-quotes@2.x
    - vtex.b2b-quotes-graphql@3.x
    - vtex.b2b-suite@1.x
    - vtex.b2b-theme@4.x
    - vtex.storefront-permissions@2.x
    - vtex.storefront-permissions-ui@2.x

## [0.5.0] - 2025-01-16

### Changed
- Changed cost center autocomplete to give suggestions based on the selected organizations

## [0.4.0] - 2024-09-26

### Fixed

- Implement cost center autocomplete, lazyload in organization autocomplete and maxHeight prop

## [0.3.2] - 2024-08-22

### Fixed
- shows more options in the cost centers dropdown


### Removed
- [ENGINEERS-1247] - Disable cypress tests in PR level

## [0.3.1] - 2022-11-11

### Changed

- Run schedule job only on saturday

### Fixed

- minimist package updated from 1.2.5 to 1.2.7 due a critical security vulnerability


### Changed

- Updated cypress strategy

### Changed

- Split bindings testcase into two files

### Changed

- GitHub reusable workflow and Cy-Runner updated to version 2

## [0.3.0] - 2022-09-12

### Added

- Added one to many feature

## [0.2.0] - 2022-07-12

### Added

- Bulgarian, Dutch, French, Italian, Japanese, Korean, Portuguese, Romanian, Spanish and Thai translations.

### Fixed

- English translation.

## [0.1.1] - 2022-07-04

### Added

- Initial Crowdin integration

## [0.1.0] - 2022-05-27

### Added

- Autocomplete input to select an organization
- Button to remove a user's B2B info
- Heading and border for B2B info section

## [0.0.8] - 2022-02-18

### Added

- Added alert messaging to block the user from saving incomplete configurations
- Added validation to make sure roles get assigned the correct settings
- Disabled save button when the invalid settings is detected

## [0.0.7] - 2022-01-10

### Removed

- Can Impersonate
- Console logs

## [0.0.6] - 2022-01-06

## [0.0.5] - 2021-12-28

### Added

- Allow cleanup Organization selection

### Fixed

- Cost Center not cleaning up after organization is changed

## [0.0.4] - 2021-11-10

## [0.0.3] - 2021-11-03

### Fixed

- Add `provider` context to `saveUser` mutation

## [0.0.2] - 2021-10-29

### Fixed

- Filter organizations by active status

## [0.0.1] - 2021-09-24

### Added

- Initial release
