<template>
  <v-container class="pa-0 ma-0">
    <!-- Seek card -->
     <v-card class="my-2 ma-2">
      <v-card-text>
        <div class="my-2 subtitle-1">{{ seek.seek }}</div>

        <!-- Readonly star rating showing aggregated score -->
        <div v-if="seek.type==='Star'">
          <v-rating :value="seek.avgScore" color="amber" dense half-increments readonly size="24"
          ></v-rating> ({{ seek.answers }} ratings)
        </div>

        <div class="my-4 subtitle-2">
          Posted <strong>{{ moment.unix(seek.created/1000).fromNow() }}</strong>
          <strong v-if="seek.author===$store.getters.getUser.sub"> by you</strong>
        </div>
      </v-card-text>
  
      <!-- Only show "Answer" button for seeks asked by different user -->
      <v-card-actions v-if="seek.author!=$store.getters.getUser.sub">

        <!-- For star rating seeks -->
        <div v-if="seek.type==='Star'">
          <v-btn text color="orange" dark @click="openDialog(seek)">
            Answer
          </v-btn>
        </div>

        <!-- For geo rating seeks -->
        <div v-if="seek.type==='Geo'">
          <v-btn text color="orange" dark @click="openMapDialog(seek)">
            Answer on map
          </v-btn>
          <v-btn :disabled="seek.answers===0" text color="orange" dark :to="{ name: 'Answers', query: { hk: seek.hashKey, rk: seek.rangeKey }}">
            See results
          </v-btn>
        </div>

        <!-- <v-spacer></v-spacer> -->
      </v-card-actions>
      <v-divider class="mx-4"></v-divider> 
    </v-card> 

    <!-- Popup star rating dialog for answering seek -->
    <v-dialog v-model="dialog" persistent max-width="290">
      <v-card>
        <v-card-title class="headline">Your rating:</v-card-title>
        <v-card-text>
          <!-- <div class="my-1 subtitle-2">Your rating: </div> -->
          <v-rating v-model="starRating"
            color="amber"
            dense
            half-increments
            size="40"
          ></v-rating>
        </v-card-text>            
        <v-card-actions> 
          <v-spacer></v-spacer>
          <v-btn :disabled="starRating===0||saving===true" color="success" text @click="submitDialog('star')">Submit</v-btn>
          <v-btn :disabled="saving===true" color="error" text @click="dialog=false">Cancel</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Popup geo rating dialog for answering seek -->
    <v-dialog v-model="mapDialog" persistent>
      <v-card>
        <v-card-title class="headline">Drop a pin on your answer:</v-card-title>
        <v-card-text>
          <!-- <div class="my-1 subtitle-2">Your rating: </div> -->
          <GmapMap
            ref="gmap"
            :center="{lat:this.position.latitude, lng:this.position.longitude}"
            :zoom="7"
            map-type-id="roadmap"
            style="width: 100%; height: 400px"
            
            :options="{
              zoomControl: false,
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
              v-for="(m, index) in markers"
              :position="m.position"
              @click="center=m.position"
            ></GmapMarker>    
            <GmapCircle
              :center="{lat:this.currentSeek.latitude, lng:this.currentSeek.longitude}"
              :radius="8000"
              @click="addMarker"
              :options="{
                fillColor:'blue',
                fillOpacity:0.1,
                strokeColor: '#0000FF',
                strokeOpacity: 0.2,
                strokeWeight: 5
              }"
            />
          </GmapMap>     
        </v-card-text>            
        <v-card-actions> 
          <v-spacer></v-spacer>
          <v-btn :disabled="markers.length===0||saving===true" color="success" text @click="submitDialog('geo')">Submit</v-btn>
          <v-btn :disabled="saving===true" color="error" text @click="mapDialog=false">Cancel</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

  </v-container>
</template>

<script>
import axios from "axios"
import { mapState } from 'vuex'

export default {
  name: "HomeView",
  props: ['seek'],
  data: function () {   
    return {
      dialog: false,
      mapDialog: false,
      markers: [],
      starRating: 0,
      saving: false,
      currentSeek: {
        latitude: 40.7358235,
        longitude: -73.9927102,
      }
    }
  },
  computed: {
    ...mapState({
      position: (state) => state.position
    })
  },
  methods: {
    openDialog(seek) {
      console.log(seek)
      this.currentSeek = seek
      this.starRating = 0  // reset rating
      this.dialog = true
    },
    openMapDialog(seek) {
      console.log(seek)
      this.currentSeek = seek
      this.markers = []
      this.mapDialog = true
    },    
    addMarker(event) {
      const marker = {
        lat: event.latLng.lat(),
        lng: event.latLng.lng()
      };
      this.markers.pop() // Only one marker allowed
      this.markers.push({ position: marker })
    },
    async submitDialog(type) {
      console.log('submitDialog')

      const token = await this.$auth.getTokenSilently();
      const url = `${this.$APIurl}/answers`
      this.saving = true

      // Build payload for star/geo type seeks
      let payload = {
        seek: this.seek,
        type
      }

      if (type === 'star') {
        payload.rating = this.starRating
      } else {
        payload.lat = this.markers[0].position.lat
        payload.lng = this.markers[0].position.lng
      }

      console.log('Payload: ', payload)
      try {
        const { data } = await axios.post(url, payload,
          {
            headers: { 
              Authorization: `Bearer ${token}`
            }
          })
        console.log('Result: ', data) 
      } catch (err) {
        console.error('Error: ', err)
      }

      this.dialog = false
      this.mapDialog = false
      this.saving = false
    }
  }
}

</script>
