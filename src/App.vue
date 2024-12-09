<template>
  <section class="han_analytics">
    <header>
      <div class="main">
        <div class="logo">
          <img src="./assets/favicon.ico">
          <span>Web Analytics</span>
        </div>
        <h2>Web分析</h2>
      </div>
    </header>
    <main>
      <header>
        <Alert>
          <AlertDescription>
            <p style="font-weight: bold;">· 开源地址: <a class="git-link" href="https://github.com/weiiiiiu/HanAnalytics"
                target="_blank">Han-Analytics</a>
            </p>
          </AlertDescription>
        </Alert>
      </header>

      <section class="main">
        <div class="pb-5 grid md:grid-cols-2 sm:grid-cols-1 items-start">
          <div class="flex gap-[16px] pb-6">
            <div class="w-3/6">
              <Select :disabled="siteList.length < 1 || getDatasStatus" v-model="siteValue"
                @update:model-value="getDatas">
                <SelectTrigger class="w-[218px]">
                  <SelectValue placeholder="选择站点" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Web Site</SelectLabel>
                    <SelectItem :value="i" v-for="i in siteList" :key="i">{{ i }}</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div class="w-3/6">
              <Select :disabled="siteList.length < 1 || getDatasStatus" v-model="timeValue"
                @update:model-value="getDatas">
                <SelectTrigger class="w-[218px]">
                  <SelectValue placeholder="选择周期" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Cycle Time</SelectLabel>
                    <SelectItem :value="i.value" v-for="i in timeList" :key="i.name">{{ i.name }}</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div
            class="flex justify-end text-center md:text-right line-clamp-1 [&>.views-item]:flex [&>.views-item]:flex-col [&>.views-item]:items-center md:[&>.views-item]:items-end [&>.views-item]:gap-4 [&>.views-item>span]:text-sm [&>.views-item>p]:text-3xl [&>.views-item>p]:line-clamp-1 [&>.views-item>p]:w-full">
            <div class="views-item w-full overflow-hidden">
              <span>Views</span>
              <div class="space-y-2 w-[50%]" v-if="resData.visit.views === undefined">
                <Skeleton class="h-4  w-[50%] ml-auto" />
                <Skeleton class="h-4" />
              </div>
              <p v-else>{{ resData.visit.views }}</p>
            </div>
            <div class="views-item w-full overflow-hidden">
              <span>Visitors</span>
              <div class="space-y-2 w-[50%]" v-if="resData.visit.visitor === undefined">
                <Skeleton class="h-4  w-[50%] ml-auto" />
                <Skeleton class="h-4" />
              </div>
              <p v-else>{{ resData.visit.visitor }}</p>
            </div>
            <div class="views-item w-full overflow-hidden">
              <span>Visits</span>
              <div class="space-y-2 w-[50%]" v-if="resData.visit.visit === undefined">
                <Skeleton class="h-4  w-[50%] ml-auto" />
                <Skeleton class="h-4" />
              </div>
              <p v-else>{{ resData.visit.visit }}</p>
            </div>
          </div>
        </div>

        <div ref="echartsDOM" class="data-view"></div>

        <!-- ... 其他模板代码保持不变 ... -->
      </section>
    </main>
  </section>
  <div class="z-[999999999]">
    <Toaster />
  </div>
  <AlertDialog :open="authStatus">
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>请输入登录密码</AlertDialogTitle>
        <AlertDialogDescription>
        </AlertDialogDescription>
      </AlertDialogHeader>
      <Input type="text" placeholder="Password" v-model="loginPassword" />
      <AlertDialogFooter>
        <Button :disabled="loginStatus" @click="loginFn">
          <Loader2 v-show="loginStatus" class="w-4 h-4 mr-2 animate-spin" />登录
        </Button>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>

<script setup lang="ts">
import { ref, markRaw, onMounted } from 'vue'
import * as echarts from "echarts"
import vh from 'vh-plugin'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-vue-next'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue, } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Toaster } from '@/components/ui/toast'
import { useToast } from '@/components/ui/toast/use-toast'
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, } from '@/components/ui/alert-dialog'
import { Input } from '@/components/ui/input'

const { toast } = useToast()

// 登录相关
const authStatus = ref<boolean>(false)
const session = ref<string>(localStorage.getItem('session') || '')
const loginStatus = ref<boolean>(false)
const loginPassword = ref<string>('')
const loginFn = async () => {
  if (!loginPassword.value) return toast({ description: '请输入密码', variant: 'destructive' })
  loginStatus.value = true
  const res = await fetch('/api', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'Login', session: loginPassword.value })
  })
  await new Promise(resolve => setTimeout(resolve, 666))
  loginStatus.value = false
  const data = await res.json()
  if (!data.success) return toast({ description: data.message, variant: 'destructive' })
  localStorage.setItem('session', loginPassword.value)
  session.value = loginPassword.value
  authStatus.value = false
  getSiteList()
}

// 站点列表相关
const siteList = ref<Array<string>>([])
const siteValue = ref<string>('')
const timeList = [
  { name: 'Today', value: 'today' },
  { name: 'Yesterday', value: '1d' },
  { name: 'Last 7 days', value: '7d' },
  { name: 'Last 30 days', value: '30d' },
  { name: 'Last 60 days', value: '60d' },
  { name: 'Last 90 days', value: '90d' }
]
const timeValue = ref<string>('today')

const getSiteList = async () => {
  vh.showLoading()
  try {
    const res = await fetch('/api', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'list', session: session.value })
    })
    const data = await res.json()
    if (data.code && data.code === 401) {
      localStorage.clear()
      authStatus.value = true
    }
    if (!data.success) return toast({ description: data.message, variant: 'destructive' })
    siteList.value = data.data
    siteValue.value = siteList.value[0]
    if (siteValue.value) getDatas()
  } catch (error) {
    console.log(error)
  } finally {
    vh.hideLoading()
  }
}

// 获取数据相关
const resData = ref<any>({ visit: {} })
const tempResData = ref<any>({ visit: {} })
const getDatasStatus = ref<boolean>(false)
const getDatas = async () => {
  resData.value = { visit: {} }
  tempResData.value = { visit: {} }
  const pmsARR = ['visit', 'path', 'referrer', 'os', 'soft', 'area', 'echarts']
  getDatasStatus.value = true
  vh.showLoading()
  const promisesForEach: Array<Promise<any>> = []

  pmsARR.forEach((i: any) => {
    const p = new Promise((r) => {
      (async () => {
        try {
          const pms = { type: i, siteID: siteValue.value, time: timeValue.value, session: session.value }
          const res = await fetch('/api', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(pms)
          })
          const data = await res.json()
          if (data.code && data.code === 401) {
            localStorage.clear()
            authStatus.value = true
          }
          if (!data.success) return toast({ description: data.message, variant: 'destructive' })
          tempResData.value[i] = i == 'echarts' ?
            renderEcharts(
              data.data.map((i: any) => `${i.name}${['today', '1d'].includes(timeValue.value) ? '点' : '日'}`),
              data.data.map((i: any) => `${i.value}`)
            ) : data.data
        } catch (error) {
          console.log(error)
        } finally {
          r(true)
        }
      })()
    })
    promisesForEach.push(p)
  })

  await Promise.all(promisesForEach)
  getDatasStatus.value = false
  vh.hideLoading()
  resData.value = { ...tempResData.value }
}

// 工具函数
const getIconUrl = (url: string) => {
  if (!url) return 'https://icons.duckduckgo.com/ip3/none.ico'
  const _url = new URL(url)
  return `https://icons.duckduckgo.com/ip3/${_url.hostname}.ico`
}

const getIcon = (code: string) => `${location.origin}/icon/${code}.png`

// Echarts 相关
const echartsDOM = ref<HTMLCanvasElement>()
const canvasMain = ref<any>()
const renderEcharts = async (dateList: Array<any>, valueList: Array<any>) => {
  const option = {
    grid: { left: "0", right: "0", bottom: "0", top: "10", containLabel: true },
    xAxis: {
      type: "category",
      data: dateList,
      axisLabel: { color: "#959BAA" },
      axisLine: { lineStyle: { color: "rgba(255,255,255,0.56)", width: 2, type: "dashed" } }
    },
    yAxis: { type: "value", axisLabel: { color: "#959BAA" } },
    tooltip: { trigger: "axis" },
    series: [
      {
        data: valueList,
        type: "line",
        smooth: true,
        emphasis: {
          focus: "series",
          itemStyle: { borderWidth: 2 },
          areaStyle: {
            color: {
              colorStops: [
                { offset: 0, color: "#DAE4FF" },
                { offset: 1, color: "#ffffff" }
              ],
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              type: "linear",
              global: false
            }
          }
        },
        lineStyle: {
          width: 2,
          color: {
            colorStops: [{ offset: 1, color: "#6F94F1" }],
            x: 0,
            y: 0,
            x2: 1,
            y2: 0,
            type: "linear",
            global: false
          }
        },
        showSymbol: false,
        areaStyle: {
          opacity: 1,
          color: {
            colorStops: [
              { offset: 0, color: "#DAE4FF" },
              { offset: 1, color: "#ffffff" }
            ],
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            type: "linear",
            global: false
          }
        }
      }
    ]
  }
  canvasMain.value.setOption(option)
}

onMounted(() => {
  canvasMain.value = markRaw(echarts.init(echartsDOM.value, null, { renderer: "svg", useDirtyRect: true }))
  window.addEventListener("resize", canvasMain.value.resize)
  getSiteList()
})
</script>

<style>
.fixed.inset-0.z-50,
.fixed.grid.w-full.max-w-lg.shadow-lg.duration-200 {
  z-index: 99999999;
}
</style>

<style scoped>
@import '@/assets/index.less';
</style>
