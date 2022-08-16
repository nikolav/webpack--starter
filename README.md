## about

- app state is kept in App component and is updated as user interacts with application
- pages are implemented as methods on App object and are rendered when correspnding page tab is selected
- ui is synchronized with App state where each interaction sets new state and that triggers 'event-render' event to re-generate ui based on new state fields -- `.render()` method
- static resources are bundled @dist
- setup airbnb-base linting

## demo

https://nikolav.rs/app/122/

## install dependencies

`$ yarn`

## start development server

`$ yarn start`

## production build @dist

`$ yarn run build`

## development build @dist

`$ yarn run build:dev`

## run linter

`$ yarn run lint`

## prettier /src

`$ yarn run prettier`
