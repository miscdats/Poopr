'use strict'
import Vue from 'vue'
import * as VueGoogleMaps from 'vue2-google-maps'

import App from './App.vue'
import vuetify from './plugins/vuetify'
import router from './router'
import store from './store'
import IoT from '@/components/IoT'

import moment from 'moment'
Vue.prototype.moment = moment

// Import the Auth0 configuration
import { domain, clientId, audience } from "../../frontend/auth_config.json"

// Import the plugin here
import { Auth0Plugin } from "./auth"

// Realtime websocket notifications
Vue.component('iot', IoT)


/* ===================================================
                      CONFIGURATION
   =================================================== */

Vue.config.productionTip = false
Vue.prototype.$appName = 'Poopr'
// Google Maps key - see https://developers.google.com/maps/documentation/javascript/get-api-key
Vue.prototype.$GoogleMapsKey = 'AIzaSyDroOWOPbDvOPIMhLHvX7MK6etbqr6C3Z8'

// API Gateway endpoint - e.g. https://abc123abc.execute-api.us-east-1.amazonaws.com
Vue.prototype.$APIurl = 'https://48yrk78uil.execute-api.us-west-2.amazonaws.com'

// ** Websocket connection **

//  PoolId: Retrieve this with the CLI command: aws cognito-identity list-identity-pools --max-results 10
Vue.prototype.$poolId = 'us-west-2:5b3b653f-46d4-43b0-a466-79fccddf0618', // 'YourCognitoIdentityPoolId'

//  IoTendpoint: Retrieve this with the CLI command: aws iot describe-endpoint --endpoint-type iot:Data-ATS
Vue.prototype.$host = 'ai4m81gweyn4a-ats.iot.us-west-2.amazonaws.com', // 'YourAwsIoTEndpoint', e.g. 'prefix.iot.us-east-1.amazonaws.com'

//  This is the region you selected in the SAM template deployment.
Vue.prototype.$region = 'us-west-2' // Your region

/* ===================================================
                    END CONFIGURATION
   =================================================== */

Vue.use(VueGoogleMaps, {
  load: {
    key: Vue.prototype.$GoogleMapsKey,
    libraries: 'places',
  },
  installComponents: true
})

// Install the authentication plugin here
Vue.use(Auth0Plugin, {
  domain,
  clientId,
  audience,
  onRedirectCallback: appState => {
    router.push(
      appState && appState.targetUrl
        ? appState.targetUrl
        : window.location.pathname
    )
  }
})

export const bus = new Vue()

new Vue({
  vuetify,
  router,
  store,
  render: h => h(App)
}).$mount('#app')
