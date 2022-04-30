# my-ui-vue

一個以欄位定義為中心的Vue2 UI組合。

## Install Vue cli
### npm
```
npm install -g @vue/cli
```
### yarn
```
yarn global add @vue/cli
```

## Create a Vue 2 project
```
vue create sampleapp
cd sampleapp
```

## Installation
### npm
#### Install my-ui-vue
```
npm install @myweblab/my-ui-vue
```
#### Install peerDependencies
```
npm install "bootstrap@^4.6.1" "jquery@^3.6.0" "popper.js@^1.16.1" "@fortawesome/fontawesome-free@^5.15.4" "file-saver@^2.0.5" "exceljs@^4.3.0" "pdfmake@^0.2.5"
```
### yarn
#### Install my-ui-vue
```
yarn add @myweblab/my-ui-vue
```
#### Install peerDependencies
```
yarn add "bootstrap@^4.6.1" "jquery@^3.6.0" "popper.js@^1.16.1" "@fortawesome/fontawesome-free@^5.15.4" "file-saver@^2.0.5" "exceljs@^4.3.0" "pdfmake@^0.2.5"
```

## Import CSS & JavaScript
```js
import '@fortawesome/fontawesome-free/css/fontawesome.css';
import '@fortawesome/fontawesome-free/css/solid.css';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap';

import 'my-ui-vue/src/main.css';
import MyTable from 'my-ui-vue/src/components/MyTable';
import 'my-ui-vue/src/components/MyTable/style.css';
import * as validators from 'my-ui-vue/src/validators';
import columnsUtil from 'my-ui-vue/src/utils/columnsUtil';
```

## Docs
[MyTable Doc](https://acute-era-955.notion.site/MyTable-Doc-58d0e805b757475cb536a8b642182bd7)
