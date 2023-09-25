<template>
  <div class="h-[72px] flex items-center justify-between nav">
    <h1 class="ml-10 text-2xl">Deeping Stock</h1>
    <div>
      <RouterLink to="/" class="nav-a shadow">首頁</RouterLink>
      <RouterLink to="/stock" class="nav-a shadow">股票</RouterLink>
      <RouterLink to="/stockFilter" class="nav-a shadow">股票篩選器</RouterLink>
      <RouterLink to="/hotMap" class="nav-a shadow">股票熱區地圖</RouterLink>
    </div>
  </div>
  <slot name="main" />
</template>
<script setup></script>
<style lang="scss" scoped>
.nav {
  // background: linear-gradient(180deg, #80A0C6 0%, #D8E1EC 100%);
  border-bottom: 1px solid rgb(214, 214, 214);
  box-shadow: 5px 5px 20px 10px rgba(181, 181, 181, 0.25);
}
h1 {
  color: #063a34;
  font-weight: 900;
  // text-shadow: 2px 2px 0px #a2c8c4;
  text-shadow: 1px 1px 0px #063a34;
}
</style>
