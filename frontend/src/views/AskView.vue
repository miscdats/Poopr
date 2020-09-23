<template>
  <div class="home">
    <v-container>
      <v-card class="ma-2">
        <v-card-title class="headline">Look For Potty</v-card-title>
        <v-card-subtitle>Seek relief with users around you.</v-card-subtitle>

        <v-form class="ma-4"
          ref="form"
          v-model="valid"
          :lazy-validation="lazy"
        >
          <v-text-field
            v-model="seek"
            :counter="100"
            :rules="seekRules"
            label="Seek"
            required
          ></v-text-field>
    
          <v-select
            v-model="type"
            :items="items"
            :rules="[v => !!v || 'Seek type is required']"
            label="Seek type"
            required
          ></v-select>
          <v-spacer></v-spacer>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn :disabled="!valid"
            color="success"
            class="mr-4"
            @click="saveSeek" text>Submit</v-btn>
            <v-btn color="error"
            class="mr-4"
            @click="reset" text>Cancel</v-btn>
           </v-card-actions>
        </v-form>
      </v-card>    
    </v-container>    
  </div>
</template>

<script>
import axios from "axios"
export default {
  name: 'AskView',
  data: () => ({
    valid: true,
    seek: '',
    seekRules: [
      v => !!v || 'Seek is required',
      v => (v && v.length <= 100) || 'Seek must be less than 100 characters',
    ],
    type: null,
    items: [
      'Star rating',
      'Geo rating',
    ],
    lazy: false
  }),  
  methods: {
    validate () {
      this.$refs.form.validate()
    },
    reset () {
      this.$refs.form.reset()
      this.$router.push('/')
    },
    async saveSeek() {
      const token = await this.$auth.getTokenSilently();
      const url = `${this.$APIurl}/seeks`

      const payload = { 
        seek: this.seek,
        type: this.type,
        position: this.$store.getters.getPosition
      }
      console.log('URL: ', url)
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
      this.reset()
    }
  }
}
</script>
