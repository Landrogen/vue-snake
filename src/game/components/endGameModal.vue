<template>
    <div class="modal">
        <h1>Game Over</h1>
        point: {{points}}
    </div>
</template>

<script lang="ts">
  import {Component, Prop, Vue} from 'vue-property-decorator';

  @Component
  export default class EndGAmeModal extends Vue {
    @Prop() private points!: number;
  }
</script>

<style scoped>
    .modal {
        position: fixed;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        padding: 20px;
        background-color: #fff;
        box-shadow: 0 0 4px rgba(0, 0, 0, .4);
    }
</style>
