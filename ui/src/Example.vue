<template>
  <el-tab-pane label="Example" name="example" style="position: relative">
    <el-tabs v-model="open" style="margin: 12px;">
      <el-tab-pane v-for="type in exampleTypes" :name="type" :label="type" style="position: relative;">
        <highlightjs autodetect :code="getExample(type)" style="border-radius: 6px;"
                     :class="type==='swift'?'swift':'java'"/>
        <el-icon @click="copy(getExample(type))" color="white"
                 style="position: absolute;right: 8px;top: 8px;">
          <CopyDocument/>
        </el-icon>
      </el-tab-pane>
    </el-tabs>
  </el-tab-pane>
</template>

<script>
import useClipboard from "vue-clipboard3";
import {CopyDocument} from "@element-plus/icons-vue";
import {javaCallExample, retrofitCallExample} from "components/Module2Java";
import {jsCallExample} from "components/Module2Js";
import {swiftCallExample} from "components/Module2Swift";
import {arkTsCallExample} from "components/Module2ArkTs";

let {toClipboard} = useClipboard();
export default {
  name: 'Example',
  components: {CopyDocument},
  props: ['item', 'tryIt'],
  data() {
    return {
      exampleTypes: ['swift', 'retrofit', 'axios', 'java', 'arkTs'],
      open: "swift",
      header: null,
      query: null,
      common: null,
      body: null,
      files: null,
      multiFiles: false,
      responses: null
    }
  },
  methods: {
    copy(content) {
      toClipboard(content);
      this.$message.success('复制成功')
    },
    getExample(type) {
      if (type === 'java') {
        return javaCallExample(this.item);
      } else if (type === 'axios') {
        return jsCallExample(this.item);
      } else if (type === 'swift') {
        return swiftCallExample(this.item);
      } else if (type === 'retrofit') {
        return retrofitCallExample(this.item);
      } else if (type === 'arkTs') {
        return arkTsCallExample(this.item);
      }
      return ''
    }
  }
}
</script>

<style scoped>

</style>