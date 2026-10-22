<script>

export default {
    data() {
        return {
            library_name: "tung tung tung sahur",
            message: "welcome to tung tung tung sahur",
            city: "Paonta Sahib",
            books: [
              { id: 1, title: 'The Hobbit', author: 'J.R.R. Tolkien', available: true },
              { id: 2, title: 'Dune', author: 'Frank Herbert', available: false },
              { id: 3, title: 'Wings of Fire', author: 'A.P.J. Abdul Kalam', available: true },
            ],
    }
  },
}

</script>

<template>

<main class="container mt-4">
    <h1><pre>{{library_name}}, {{Chennai}}</pre></h1>
    <p class="lead">{{message}}</p>

    <ul v-if="books.length > 0" >

        <li v-for="book in books" :key="book.id">

            <span>
              {{ book.title }} <small class="text-muted">by {{ book.author }}</small>
            </span>

            <span v-if="book.available">Available</span>
            

            
        </li>

    </ul>
    <p v-else>No books are available</p>
    
</main>

</template>

<style>
h1 {
  color: #42b983;
}

</style>