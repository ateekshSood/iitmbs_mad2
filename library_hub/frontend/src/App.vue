<template>
  <nav class="navbar navbar-expand navbar-dark bg-dark px-3">
    <RouterLink class="navbar-brand" to="/">Library Hub</RouterLink>
    <div class="navbar-nav">
      <RouterLink class="nav-link" to="/sessions">Sessions</RouterLink>
      <RouterLink class="nav-link" to="/about">About</RouterLink>
    </div>
  </nav>
  <RouterView />
</template>