<template>
  <div id="particles"></div>
</template>

<script>
import "@/utils/particles.min";
const particlesConfig = {
  particles: {
    number: {
      value: 40,
      density: {
        enable: true,
        value_area: 1200,
      },
    },
    color: {
      value: "#ffffff",
    },
    shape: {
      type: "circle",
      polygon: {
        nb_sides: 2,
      },
    },
    opacity: {
      value: 0.5,
      random: false,
      anim: {
        enable: false,
        speed: 1,
        opacity_min: 0.3,
        sync: false,
      },
    },
    size: {
      value: 5,
      random: true,
      anim: {
        enable: false,
        speed: 40,
        size_min: 0.1,
        sync: false,
      },
    },
    line_linked: {
      enable: true,
      distance: 300,
      color: "#ffffff",
      opacity: 0.8,
      width: 1,
    },
    move: {
      enable: true,
      speed: 3,
      direction: "none",
      random: false,
      straight: false,
      out_mode: "out",
      bounce: false,
      attract: {
        enable: false,
        rotateX: 600,
        rotateY: 1200,
      },
    },
  },
  retina_detect: true,
};
export default {
  name: "Particles",
  mounted() {
    particlesJS("particles", particlesConfig);
  },
};
</script>

<style scoped>
#particles {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 45%;
  background-color: #273567;
  opacity: 0.3;
}
</style>
