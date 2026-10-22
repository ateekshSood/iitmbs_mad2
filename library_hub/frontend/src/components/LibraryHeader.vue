<script>

export default {
    name: 'LibraryHeader',
    data() {
        return {
        isOpen:true 
      }
    },

    methods: {
      toggleOpen(){
        this.isOpen = !this.isOpen;
      },
    },

    created(){
      console.log('Libraryheader created');
    },

    mounted(){
      console.log('library header mounted');
    },
}

</script>

<template>

    <nav class="navbar navbar-dark bg-dark px-3">
        <span class="navbar-brand">Library Hub</span>
        <div>
            <span v-if="isOpen" class="badge bg-success me-2">Open now</span>
            <span v-else class="badge bg-danger me-2">Closed</span>
            <button class="btn btn-sm btn-outline-light" @click="toggleOpen">Toggle</button>
        </div>
    </nav>

</template>