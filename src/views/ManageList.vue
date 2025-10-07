<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import Dexie from 'dexie';

// ----- 数据库定义 -----
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

// ----- 组件状态 -----
const lists = ref<NameList[]>([]);
const fileInputRef = ref<HTMLInputElement | null>(null);

// 读取全部名单
const loadLists = async () => {
  lists.value = await db.nameLists.toArray();
};
onMounted(loadLists);

// ----- 上传导入 -----
const importFile = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (!target.files?.length) return;
  const file = target.files?.[0]; // 可选链
  if (!file) return; // 如果没有文件直接返回
  const text = await file.text(); // UTF-8自动解析
  const members = text.split(/\r?\n/).filter(line => line.trim().length > 0);

  const newList: NameList = {
    friendlyName: file.name.replace(/\.[^/.]+$/, ''), // 默认用文件名
    members,
    createdAt: Date.now(),
    isDefault: false
  };

  const id = await db.nameLists.add(newList);
  lists.value.push({ ...newList, id });
  if (fileInputRef.value) fileInputRef.value.value = ''; // 清空文件选择
};

// ----- 新增空名单 -----
const addEmptyList = () => {
  const newList: NameList = {
    friendlyName: '新名单',
    members: [],
    createdAt: Date.now(),
    isDefault: false
  };
  db.nameLists.add(newList).then(id => {
    lists.value.push({ ...newList, id });
  });
};

// ----- 保存名单 -----
const saveList = async (list: NameList) => {
  if (!list.id) return;

  // 解包 reactive / proxy 对象
  const plainList = {
    friendlyName: list.friendlyName,
    members: Array.isArray(list.members) ? [...list.members] : [],
  };

  await db.nameLists.update(list.id, plainList);
  alert('保存成功！');
};

// ----- 设置默认名单 -----
const setDefault = async (list: NameList) => {
  if (!list.id) return;
  // 清空其他默认名单
  await db.nameLists.where('isDefault').equals(1).modify({ isDefault: false });
  await db.nameLists.update(list.id, { isDefault: true });
  // 更新本地状态
  lists.value.forEach(l => (l.isDefault = l.id === list.id));
  // alert(`已设置 "${list.friendlyName}" 为默认名单`);
};

// 删除名单
const deleteList = async (list: NameList) => {
  if (!list.id) return;
  const confirmed = confirm(`确定要删除 "${list.friendlyName}" 吗？`);
  if (!confirmed) return;
  await db.nameLists.delete(list.id);
  // 更新本地显示
  lists.value = lists.value.filter(l => l.id !== list.id);
};

// ----- 绑定 textarea 显示为一行一个姓名 -----
const membersText = (list: NameList) => computed({
  get: () => list.members.join('\n'),
  set: val => {
    list.members = val.split(/\r?\n/).filter(line => line.trim().length > 0);
  }
});
</script>

<template>
  <div class="flex justify-center items-center min-h-screen bg-base-200 ml-20">
    <div class="card bg-base-100 w-3/4 shadow-sm mt-10 mb-10">
      <div class="card-body">
        <h2 class="card-title">名单管理</h2>

        <!-- 上传导入 -->
        <p>导入新名单：
          <input ref="fileInputRef" type="file" class="file-input file-input-secondary" @change="importFile" />
          <!-- <button class="btn btn-primary ml-3" @click="fileInputRef?.click()">导入</button> -->
        </p>

        <!-- 已导入名单 -->
        <div>
          <p>已导入名单：
            <button class="btn btn-primary ml-3" @click="addEmptyList">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                stroke="currentColor" class="size-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              新增
            </button>
          </p>

          <div class="flex flex-wrap">
            <div v-for="list in lists" :key="list.id" class="card bg-base-100 w-90 shadow-sm m-5">
              <div class="card-body">
                <h2 class="card-title">
                  <label class="input">
                    <input v-model="list.friendlyName" type="text" class="grow" placeholder="请输入名单名称" />
                  </label>
                </h2>
                <textarea class="textarea h-60" placeholder="名单内容，一行一个姓名" v-model="membersText(list).value"></textarea>
                <div class="card-actions justify-end items-center space-x-0.5 mt-2">
                  <div class="items-center space-x-1" v-if="list.isDefault">
                    <div aria-label="success" class="status status-success"></div>
                    <span>默认名单</span>
                  </div>
                  <button class="btn btn-primary" @click="saveList(list)">保存</button>
                  <button class="btn btn-error" @click="deleteList(list)">删除</button>
                  <button class="btn btn-base-200" :disabled="list.isDefault" @click="setDefault(list)">默认</button>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<style scoped>

</style>
