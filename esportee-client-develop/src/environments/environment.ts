// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `angular-cli.json`.

export const environment = {
  production: false,
  backend: 'http://localhost:3000',
  'firebase': {
    'apiKey': 'AIzaSyAUmNTCuy11jYsHtRRncCbI-AqETp8TylQ',
    'authDomain': 'esportee-3c85a.firebaseapp.com',
    'databaseURL': 'https://esportee-3c85a.firebaseio.com',
    'projectId': 'esportee-3c85a',
    'storageBucket': 'esportee-3c85a.appspot.com',
    'messagingSenderId': '119362203635'
  },
};
