<template>
  <v-container class="pa-0 ma-0">

    <!-- Intro screen for unauthenticated users -->
    <div id="unauth-view" v-if="!$auth.isAuthenticated">
      <v-card class="ma-2">
        <v-list-item>
          <v-list-item-avatar color="grey"></v-list-item-avatar>
          <v-list-item-content>
            <v-list-item-title class="headline">Welcome!</v-list-item-title>
            <v-list-item-subtitle>Share local points of relief</v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
    
        <v-img
          src="@/assets/overview.jpg"
          height="194"
        ></v-img>
    
        <v-card-text>
          Who has the best sink? Where's the GOOD toilet at the local park? Get the answers for that which you seek, relief and more from locals that know!
        </v-card-text>
    
        <v-card-actions>
          <v-btn text color="orange" href="https://poopr.taupier.dev"  target="_blank">
            Poopr
          </v-btn>
          <v-btn text color="orange" href="https://github.com/miscdats/poopr/"  target="_blank">
            GitHub
          </v-btn>
          <v-spacer></v-spacer>
        </v-card-actions>
      </v-card>
    </div>

    <!-- Seeks list for authenticated users -->
    <v-container class="pa-0 ma-0" id="auth-view" v-if="$auth.isAuthenticated">
      <GmapMap
        :center="{lat:this.currentLat, lng:this.currentLng}"
        :zoom="7"
        map-type-id="roadmap"
        style="width: 100%; height: 300px"
        :options="{
          zoomControl: true,
          zoom: 11,
          mapTypeControl: false,
          scaleControl: false,
          streetViewControl: false,
          rotateControl: false,
          fullscreenControl: false,
          disableDefaultUI: false
        }"
      > 
        <GmapMarker
          :key="index"
          v-for="(m, index) in seeks"
          :position="{lat: m.latitude, lng: m.longitude}"
          :clickable="false"
          :draggable="false"
          @click="center=m.position"
        />
        <GmapCircle
          :center="{lat: currentLat, lng: currentLng}"
          :radius="8000"
          :options="{
            fillColor:'blue',
            fillOpacity:0.1,
            strokeColor: '#0000FF',
            strokeOpacity: 0.2,
            strokeWeight: 5
          }"
        />
      </GmapMap>     
    </v-container>

    <!-- Loading spinner -->
    <v-container v-if="$auth.isAuthenticated && loading" >
      <div class="text-center">
        <v-progress-circular
          :size="50"
          color="orange"
          indeterminate
        ></v-progress-circular>        
      </div>  
    </v-container>

    <!-- No seeks - prompt user to ask one -->
    <v-container v-if="seeks.length === 0 && !loading" >
      <v-card class="ma-2">
        <v-card-title class="headline">No toilets here? No way.</v-card-title>
        <v-card-subtitle>Whoa! This is a quiet neighborhood. Be the first to seek relief.</v-card-subtitle>
        <v-card-actions>
          <v-btn color="orange" text>Look For Potty</v-btn>
        </v-card-actions>
      </v-card>    
    </v-container>
    <v-container class="pa-0 ma-0" v-if="seeks.length > 0">
      <v-container class="pa-0 ma-0" v-bind:key="index" v-for="(seek, index) in seeks">
        <Seek v-bind:seek="seek"/>
      </v-container>
    </v-container>

    <!-- Add seek icon -->
    <v-container class="pa-0 ma-0">
      <v-btn 
        v-if="$auth.isAuthenticated" 
        fixed
        dark
        fab
        bottom
        right
        color="red"
        class="mb-4"
        to="/ask">
        <v-icon>add</v-icon>
      </v-btn>
    </v-container>
  </v-container>
</template>

<script>
  import axios from "axios"
  import { mapState } from 'vuex'
  import { bus } from '../main'
  import Seek from '@/components/Seek.vue'

  export default {
    name: "HomeView",
    components: {
      Seek
    },
    data: function () {   
      return {
        currentLat: 40.7358235,
        currentLng: -73.9927102,
        loading: true,
        user: null
      }
    },
    computed: {
      ...mapState(['seeks'])
    },
    mounted () {
      console.log('mounted')
      navigator.geolocation.getCurrentPosition((position) => {
        console.log('Position returned: ', position)
        this.$store.commit('setPosition', position)
        this.currentLat = position.coords.latitude
        this.currentLng = position.coords.longitude
        this.updateResults()
      }, () => {
        console.log('Error: The Geolocation service failed.')
      }, {
        enableHighAccuracy: true,
        timeout: 30000
      })
    },
    created () {
      bus.$on('authenticated', async (user) => {
        this.$store.commit('setUser', user)
        console.log('User signed in: ', this.$store.getters.getUser)

      })
    },
    methods: {
      async updateResults() {
        if (!this.$store.getters.isInitialized) return
        const token = await this.$auth.getTokenSilently()

        // Only use this line for debugging! It displays the JWT token in the browser console.
        // console.log(token)
        const url = `${this.$APIurl}/seeks?lat=${this.currentLat}&lng=${this.currentLng}`
        console.log('URL: ', url)
        const { data } = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${token}`    // send the access token through the 'Authorization' header
          }
        })
        console.log('Response: ', data)
        this.$store.commit('setAllSeeks', data)
        this.loading = false
      }
    }
  }
</script>
