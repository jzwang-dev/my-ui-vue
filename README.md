# my-ui-vue

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
npm install git+https://github.com/jianzhong-wang/my-ui-vue.git
```
### yarn
#### Install my-ui-vue
```
yarn add https://github.com/jianzhong-wang/my-ui-vue.git
```
#### Install peerDependencies
```
yarn add "bootstrap@^4.6.1" "@fortawesome/fontawesome-free@^5.15.4" "jquery@^3.6.0" "file-saver@^2.0.5" "exceljs@^4.3.0" "pdfmake@^0.2.5"
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
import { validators } from 'my-ui-vue';
```

## Docs
[MyTable Doc](https://www.notion.so/MyTable-Doc-58d0e805b757475cb536a8b642182bd7)
