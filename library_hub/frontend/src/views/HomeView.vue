
<script>

// import LibraryHeader from '@/components/LibraryHeader.vue'


const sample_books = [
    {
        id: 1,
        title: "The Hobbit",
        author: "J.R.R. Tolkien",
        available: true,
    },
    {
        id: 2,
        title: "Dune",
        author: "Frank Herbert",
        available: false,
    },
    {
        id: 3,
        title: "Wings of Fire",
        author: "A.P.J. Abdul Kalam",
        available: true,
    },
];

export default {
    data() {
        return {
            library_name: "tung tung tung sahur",
            message: "welcome to tung tung tung sahur",
            city: "Paonta Sahib",
            books: [],
            search: "",
            new_title: "",
            nextId: 4,
            newAuthor: "",
            loading: true,
            isavailable_checkbox : false,
        };
    },

    computed: {
        availableCount() {
            return this.books.filter((b) => b.available).length;
        },

         filteredBooks() {

           if(this.isavailable_checkbox){
             return this.books.filter((b) => b.available === true && b.title.toLowerCase().includes(this.search.toLowerCase()));
           }
           else{
             return this.books.filter((b) =>
                 b.title.toLowerCase().includes(this.search.toLowerCase()),
             );
           }
            
        },
    },

    methods: {
        addBook() {
            if (this.new_title.trim() === "" || this.newAuthor.trim() === "") {
                return;
            }

            this.books.push({
                id: this.nextId,
                title: this.new_title,
                author: this.newAuthor,
                available: true,
            });

            this.nextId++;
            this.new_title = "";
        },

        reset(id){
          const book = this.books.find((b) => b.id === id);
          if(book){
            book.available = ! book.available
            
          }
        },
    },

    created() {
      console.log('Home view created , books =', this.books.length);
    },

    mounted() {
        console.log(' home view has mounted , the contents are displayed on the screen');
        setTimeout(() => {
            this.books = sample_books;
            this.loading = false;
        }, 1500);
    },

    // components:{
    //   LibraryHeader
    // },
};
</script>

<template>
    <!-- <LibraryHeader></LibraryHeader> -->
    <main class="container mt-4">
        <h1>
            <pre>{{ library_name }}, {{ city }}</pre>
        </h1>
        <p class="lead">{{ message }}</p>

        <p v-if="loading">Loading books...</p>

        <div v-else-if="filteredBooks.length > 0">
            <label for="search">Search book by title : </label>
            <input v-model="search" id="search" type="text" />
            <label>

                <input type="checkbox" v-model="isavailable_checkbox">
                Available only
            </label>
    
            <p>{{ availableCount }} of {{ books.length }} avialble</p>
    
            <ul v-if="books.length > 0">
                <li v-for="book in filteredBooks" :key="book.id">
                    <span :class="{ 'text-mutted': !book.available }">
                        {{ book.title }}
                        <small class="text-mutted">by {{ book.author }}</small>
                    </span>
    
                    <span v-if="book.available">Available</span>
                    <button @click="reset(book.id)">Reset</button>
                </li>
            </ul>
        </div>
        
        <p v-else>No books are available</p>
        <input v-model="new_title" type="text" />
        <div>You typed : {{ new_title }}</div>
        <input v-model="newAuthor" type="text" />
        <div>You typed : {{ newAuthor }}</div>
        <button @click="addBook">Add book</button>
    </main>
</template>

<style>
h1 {
    color: #42b983;
}
</style>
