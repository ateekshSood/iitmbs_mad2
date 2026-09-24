<template>
    <div>
        <h2>IT Support Tickets</h2>

        <!-- Form to create a ticket -->
        <div>
            <input v-model="newIssue" placeholder="Describe the issue" />
            <button @click="submitTicket">Submit Ticket</button>
        </div>

        <!-- List of tickets -->
        <ul>
            <li v-for="ticket in tickets" :key="ticket.id">
                {{ ticket.issue }} - Status: {{ ticket.status }}
            </li>
        </ul>
    </div>
</template>

<script>
export default {
  data() {
    return {
      newIssue: "",
      tickets: []
    }
  },

  // 1. Add a lifecycle hook to call getTickets() when the component is created
  created() {
      this.getTickets();
  }


  methods: {
    // 2. Write the GET request using async/await and try/catch
    async getTickets() {
        try {
            const response = await fetch("http://localhost:5000/api/tickets");

            if (!response.ok) {
                throw new Error("Data failed to fetch");
            }

            const data = await response.json()

            this.tickets = data;


        }
      catch (err) {
            console.log(err);
      }
      // The API endpoint is: 'http://localhost:5000/api/tickets'
      // Fetch the data and assign it to this.tickets

    },

    // 3. Write the POST request using async/await and try/catch
      async submitTicket() {

          const response = await fetch("http://localhost:5000/api/tickets", {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json'
              },
              body: JSON.stringify({ Issue : this.newIssue })
          });


          if (!response.ok) {
              throw new Error("Request failed to send");

          }

          this.newIssue = "";
          this.getTickets();
          
      // The API endpoint is: 'http://localhost:5000/api/tickets'
      // Send a JSON object formatted like this: { issue: this.newIssue }
      // If the response is ok, clear the 'newIssue' input and call this.getTickets() to refresh the list

    }
  }
}
</script>
