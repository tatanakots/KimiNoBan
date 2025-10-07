<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue';
import Dexie from 'dexie';

// ---- Dexie 数据库 ----
interface NameList {
  id?: number;
  friendlyName: string;
  members: string[];
  createdAt: number;
  isDefault?: boolean;
}

class NameListDB extends Dexie {
  nameLists!: Dexie.Table<NameList, number>;
  constructor() {
    super('RandomNamePickerDB');
    this.version(1).stores({
      nameLists: '++id, friendlyName, createdAt,isDefault'
    });
  }
}

const db = new NameListDB();

// ---- 页面状态 ----
const allLists = ref<NameList[]>([]);
const selectedListId = ref<number | null>(null);
const selectedList = computed(() => allLists.value.find(l => l.id === selectedListId.value) || null);

const extractedMembers = ref<string[]>([]); // 已抽取名单
const ignoreExtracted = ref(true);
const isRunning = ref(false);
const currentName = ref('');

// 用于动画切换
let intervalId: number | undefined;

// ---- 高级菜单复选框 ----
const memberChecks = reactive<{ [name: string]: boolean }>({});

// ---- 可抽取名单 computed ----
const availableMembers = computed(() => {
  if (!selectedList.value) return [];
  return selectedList.value.members.filter(name => {
    // 姓名必须勾选
    if (!memberChecks[name]) return false;
    // 如果忽略已抽取，已抽取的姓名暂时不在可抽取名单中
    if (ignoreExtracted.value && extractedMembers.value.includes(name)) return false;
    return true;
  });
});

// ---- 加载名单 ----
const loadLists = async () => {
  allLists.value = await db.nameLists.toArray();
  const def = allLists.value.find(l => l.isDefault);
  if (def) selectedListId.value = def.id || null;
};
onMounted(loadLists);

// ---- 初始化复选框 ----
watch(selectedListId, () => {
  if (!selectedList.value) return;
  Object.keys(memberChecks).forEach(key => delete memberChecks[key]);
  selectedList.value.members.forEach(name => {
    memberChecks[name] = true; // 默认全勾选
  });
});

// ---- 开始 / 停止 ----
const autoUncheckedMembers = ref<string[]>([]); // 因抽取自动取消勾选的名单

const startStop = () => {
  if (!selectedList.value) return;
  if (!isRunning.value) {
    if (availableMembers.value.length === 0) { alert('待抽取名单为空'); return; }
    isRunning.value = true;
    intervalId = window.setInterval(() => {
      const idx = Math.floor(Math.random() * availableMembers.value.length);
      currentName.value = availableMembers.value[idx]!;
    }, 100);
  } else {
    if (intervalId) { clearInterval(intervalId); intervalId = undefined; }
    isRunning.value = false;
    if (availableMembers.value.length === 0) { alert('待抽取名单为空'); currentName.value = ''; return; }
    const idx = Math.floor(Math.random() * availableMembers.value.length);
    const name = availableMembers.value[idx]!;
    currentName.value = name;
    extractedMembers.value.unshift(name);

    if (ignoreExtracted.value) {
      memberChecks[name] = false;
      autoUncheckedMembers.value.push(name); // 记录因抽取取消的勾选
    }
  }
};

// ---- 重置 ----
const reset = () => {
  currentName.value = '';
  extractedMembers.value = [];

  // 只恢复因抽取取消的勾选
  autoUncheckedMembers.value.forEach(name => {
    if (selectedList.value?.members.includes(name)) {
      memberChecks[name] = true;
    }
  });
  autoUncheckedMembers.value = [];
};
</script>

<template>
  <div class="flex justify-center items-center min-h-screen bg-base-200 ml-20">
    <div class="card bg-base-100 w-3/4 shadow-sm mt-10 mb-10">
      <div class="card-body">
        <h2 class="card-title">随机点名</h2>
        <p>点到的同学是：</p>
        <div class="name-display m-15">
          <p class="text-center text-9xl whitespace-nowrap overflow-x-auto h-40">{{ currentName || '——' }}</p>
        </div>

        <div class="flex justify-center items-center space-x-4">
          <button class="btn btn-primary" @click="startStop">{{ isRunning ? '停止' : '开始' }}</button>
          <button class="btn btn-base-200" @click="reset">重置</button>
          <label class="flex items-center space-x-2 cursor-pointer">
            <input type="checkbox" v-model="ignoreExtracted" class="checkbox" />
            <span>忽略已点名</span>
          </label>
        </div>

        <!-- 已抽取列表 -->
        <div class="card shadow-sm m-5">
          <div class="cardbody overflow-x-auto h-50">
            <table class="table table-base table-pin-rows table-pin-cols">
              <thead>
                <tr>
                  <td>已点名学生</td>
                </tr>
              </thead>
              <tbody>
                <tr v-for="name in extractedMembers" :key="name">
                  <td>{{ name }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="divider m-10"></div>

        <!-- 高级菜单 -->
        <div class="collapse collapse-arrow bg-base-100 border-base-300 border">
          <input type="checkbox" />
          <div class="collapse-title font-semibold">高级</div>
          <div class="collapse-content text-base">
            <p>名单：
              <select class="select" v-model="selectedListId">
                <option disabled value="">请选择名单</option>
                <option v-for="list in allLists" :key="list.id" :value="list.id">{{ list.friendlyName }}</option>
              </select>
            </p>

            <div class="card shadow-sm m-5">
              <div class="cardbody overflow-x-auto h-100">
                <table class="table table-base table-pin-rows table-pin-cols">
                  <thead>
                    <tr>
                      <th><label><input type="checkbox" class="checkbox" disabled /></label></th>
                      <td>姓名</td>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="name in selectedList?.members || []" :key="name">
                      <th>
                        <label>
                          <input type="checkbox" class="checkbox" v-model="memberChecks[name]" />
                        </label>
                      </th>
                      <td>{{ name }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
