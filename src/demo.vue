<template>
  <div class="cp-page">
    <rl-table :cfg="cfg" ref="houseTable" @addHouse="addHouse" @getSelection="getSelection"></rl-table>
    <el-dialog
      :title="addName"
      :close-on-click-modal="false"
      :visible.sync="addHouseVisible"
      width="500px"
    >
      <el-form
        :model="form"
        :rules="rules"
        ref="newForm"
        label-width="7em"
        class="cp-dialog-form"
        size="small"
      >
        <form-item :form="form" :x="x" v-for="(x,i) in formListDate" :key="i">
          <el-input
            v-if="x.name==='建筑面积'"
            v-model="form.acreage"
            placeholder="建筑面积"
            size="small"
            style="width:200px"
          >
            <template slot="append">m²</template>
          </el-input>
        </form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" style="width:200px" placeholder="请输入小区名称"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="addHouseVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveHouse" :loading="loading">
          <span v-if="!loading">确 定</span>
          <span v-else>提交中...</span>
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { Table, FormItem } from "@repackel/repack";
import jsondata from "./requst.json";
const houstStatesList = [
  {
    name: "状态1",
    val: "1"
  },
  {
    name: "状态2",
    val: "2"
  },
  {
    name: "状态3",
    val: "3"
  }
];
export default {
  name: "house",
  components: {
    [Table.name]: Table,
    FormItem
  },
  data() {
    return {
      loading: false,
      hidden: false,
      cfg: {
        pageAlias: {
            current:"page",
            size:"limit"
        },
        actionAlign: "right",
        actionList: [
          {
            name: "添加房屋",
            e: "addHouse", // event use e an custom event
            icon: "el-icon-plus"
          },
          {
            name: "删除房屋",
            icon: "el-icon-delete",
            type: "plain",
            fn: this.delHouseMulti // event use fn
          }
        ],
        searchCfg: {
          queryBtn: "2"
        },
        searchList: [
          {
            name: "房号",
            type: "input",
            key: "doorNo"
          },
          {
            name: "房屋状态",
            type: "select",
            key: "houseStatus",
            list: houstStatesList
          }
        ],
        searchFn: this.getHouse,
        tableSelection: true,
        tableList: [
          {
            label: "楼栋 / 单元",
            width: 140,
            transform: r => `${r.buildName || ""} ${r.unitName || ""}`
          },
          {
            label: "房号",
            width: 80,
            prop: "doorNo"
          },
          {
            label: "产权人",
            prop: "name",
            width: 80
          },
          {
            label: "手机号",
            prop: "mobile",
            minWidth: 120
          },
          {
            label: "建筑面积",
            prop: "acreage",
            align: "center",
            transform: r => r.acreage + "㎡",
            minWidth: 120
          },
          {
            label: "房屋状态",
            minWidth: 120,
            transform: r => ["", "状态1", "状态2", "状态3"][r.houseStatus],
            style: r => ({
              color: ["", "red", "green", "orange"][r.houseStatus],
              cursor: ["", "pointer", "", ""][r.houseStatus]
            }),
            fn: (r, i) => {
              if (r.houseStatus === "1") {
                this.$msg(i + "状态" + r.houseStatus);
              }
            }
          },
          {
            temp: true,
            label: "操作",
            width: "120",
            // fixed: "false",
            buttonList: [
              {
                text: "查看",
                fn: row => this.$msg(row.houseId)
              },
              {
                text: "编辑",
                fn: row => this.editHouse(row)
              },
              {
                text: "删除",
                fn: row => this.delHouse(row.houseId)
              }
            ]
          }
        ]
      },
      addHouseVisible: false,
      form: {},
      rules: {
        buildingId: [
          {
            validator: (rule, value, callback) => {
              if (!this.form.buildingId) {
                callback(new Error("请选择所属楼栋"));
              } else {
                callback();
              }
            },
            trigger: "blur"
          }
        ]
      },
      hosueList: [],
      formListDate: [
        {
          name: "房间号",
          type: "input",
          inline: true,
          width: "200px",
          key: "doorNo"
        },
        {
          name: "建筑面积",
          inline: true,
          norule: true
        },
        {
          name: "房屋状态",
          type: "select",
          inline: true,
          key: "houseStatus",
          list: houstStatesList,
          width: "200px",
          norule: true
        },
        {
          name: "产权人",
          type: "input",
          inline: true,
          key: "name",
          width: "200px",
          norule: true
        },
        {
          name: "手机号",
          type: "input",
          inline: true,
          maxlength: 11,
          width: "200px",
          key: "mobile",
          norule: true
        }
      ],
      addName: "",
      buildingId: "",
      currentUnit: "",
      treeObj: {}
    };
  },
  mounted() {},
  methods: {
    $translateLoc() {},
    $msg(text) {
      this.$message({
        showClose: true,
        message: text,
        type: "success"
      });
    },
    getHouse(p, reset) {
      // querty params
      let p2 = {
        ...p
      };
      if (!reset) {
        // assgion extra data
        Object.assign(p2, this.treeObj);
      } else {
        // reset extra data
        this.treeObj = {};
      }
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const data = {
            list: jsondata,
            total: 10
          };
          resolve(data);
        }, 750);
        // this.$req("/community/house/list", {
        //   method: "GET",
        //   params: p2
        // }).then(res => {
        //   resolve({
        //     list: res.rows,
        //     total: res.total
        //   });
        // });
      });
    },
    async saveHouse() {
      let method = "POST";
      let data = this.form;
      if (this.addName === "编辑房屋") {
        method = "PUT";
        data = this.form;
      }
      const isValid = await this.formIsValid("newForm");
      if (!isValid) {
        return;
      }
      if (!data.doorNo) {
        this.$message.info("请输入房间号");
        return;
      }
      this.loading = true;
      this.$req("/community/house", {
        method,
        data
      })
        .then(res => {
          this.$msg("提交成功！");
          this.addHouseVisible = false;
          this.$refs.houseTable.getList();
          this.loading = false;
        })
        .catch(err => {
          // this.addHouseVisible = false;
          this.loading = false;
        });
    },
    editHouse(row) {
      this.addHouseVisible = true;
      this.form = row;
      this.addName = "编辑房屋";
      this.currentUnit = [row.plotName, row.buildName, row.unitName].join(
        " / "
      );
    },
    addHouse() {
      this.addHouseVisible = true;
      this.form = {};
      this.addName = "添加房屋";
    },
    delHouse(id) {
      const delFn = () => {
        this.$req("/community/house/delete/" + id, {
          method: "DELETE"
        })
          .then(res => {
            this.$msg("删除成功！");
            this.$refs.houseTable.getList();
          })
          .catch(err => {
            this.$refs.houseTable.getList();
          });
      };
      this.$confirm("确定删除房屋信息？", "删除房屋", {
        type: "warning"
      })
        .then(_ => delFn())
        .catch(_ => {});
    },
    getSelection(val) {
      this.selectIds = val.map(x => x.houseId).join(",");
    },
    delHouseMulti() {
      if (!this.selectIds) {
        this.$message.info("请勾选要删除的房屋");
        return;
      }
      this.delHouse(this.selectIds);
    },
    getTree(tree) {
      let { buildingType, buildingId } = tree;
      this.treeObj = {};
      if (buildingType === 1) {
        this.treeObj.plotId = buildingId;
      } else if (buildingType === 2) {
        this.treeObj.buildingId = buildingId;
      } else if (buildingType === 3) {
        this.treeObj.unitId = buildingId;
      }
      // change page index
      this.$refs.houseTable.handleCurrentChange(1);
    }
  }
};
</script>
