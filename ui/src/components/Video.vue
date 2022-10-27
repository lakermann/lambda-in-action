<script>
import axios from "axios";

export default {
  props: {
    youtubeId: String,
    videoId: String,
    urlEndpoint: String,
    apiKey: String,
  },
  methods: {
    playVideo() {
      this.player.playVideo();
    },
    async playing() {
      console.log("\o/ we are watching!!!");
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
  computed: {
    player() {
      return this.$refs.youtube.player;
    },
  },
};
</script>

<template>
  <div>
    <youtube :video-id="youtubeId" ref="youtube" @playing="playing"></youtube>
  </div>
</template>
