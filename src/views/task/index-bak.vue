<template>
  <el-container>
    <el-main>
      <div class="content">
        <p>平台声明</p>
      </div>
    </el-main>
  </el-container>
</template>

<style>
.content {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  text-align: justify;
  line-height: 1.5;
}
</style>

<script>
import { getToken } from '@/utils/auth'

export default {
  data() {
    return {
    }
  },
  created() {
    // 用户没有登录，则跳转到登录页面
    this.gotoLogin()
  },
  methods: {
    gotoLogin() {
      if (!getToken()) {
        this.$router.push({ path: '/login' })
      }
    }
  }
}
</script>
