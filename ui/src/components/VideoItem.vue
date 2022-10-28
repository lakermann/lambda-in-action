<script lang="ts">
import { defineComponent } from "vue";
import axios from "axios";

export default defineComponent({
  props: {
    youtubeId: String,
    videoId: String,
    urlEndpoint: String,
    apiKey: String,
  },
  methods: {
    async playing() {
      console.log("we are watching!!!");
      const reqInstance = axios.create({
        headers: {
          //Authorization : `Bearer ${localStorage.getItem("access_token")}`
          traceId: `test-trace-id`,
          userId: `test-user-id`,
          "X-Api-Key": this.apiKey,
        },
      });

      await reqInstance.post(`${this.urlEndpoint}/videos/${this.videoId}`);
    },
  },
});
</script>

<template>
  <div>
    <youtube :video-id="youtubeId" ref="youtube" @playing="playing"></youtube>
  </div>
</template>
