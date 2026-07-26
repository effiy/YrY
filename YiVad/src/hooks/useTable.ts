import { Table } from "./interface";
import { reactive, computed, toRefs } from "vue";

/**
 * @description Table page operation methods
 * @param {Function} api API method for fetching table data (required)
 * @param {Object} initParam Initial parameters for fetching data (optional, default: {})
 * @param {Boolean} isPageable Whether pagination is enabled (optional, default: true)
 * @param {Function} dataCallBack Callback for processing backend data (optional)
 * */
export const useTable = (
  api?: (params: any) => Promise<any>,
  initParam: object = {},
  isPageable: boolean = true,
  dataCallBack?: (data: any) => any,
  requestError?: (error: any) => void
) => {
  const state = reactive<Table.StateProps>({
    // Table data
    tableData: [],
    // Pagination data
    pageable: {
      // Current page number
      pageNum: 1,
      // Items per page
      pageSize: 10,
      // Total items
      total: 0
    },
    // Search parameters (search only)
    searchParam: {},
    // Initial default search parameters
    searchInitParam: {},
    // Total parameters (including pagination and search)
    totalParam: {}
  });

  /**
   * @description Pagination query parameters (pagination and table column sorting; other sorting can be configured)
   * */
  const pageParam = computed({
    get: () => {
      return {
        pageNum: state.pageable.pageNum,
        pageSize: state.pageable.pageSize
      };
    },
    set: (newVal: any) => {
      console.log("Page update value", newVal);
    }
  });

  /**
   * @description Get table data
   * @return void
   * */
  const getTableList = async () => {
    if (!api) return;
    try {
      // Put initial and pagination params into total params first
      Object.assign(state.totalParam, initParam, isPageable ? pageParam.value : {});
      let { data } = await api({ ...state.searchInitParam, ...state.totalParam });
      dataCallBack && (data = dataCallBack(data));
      state.tableData = isPageable ? data.list : data;
      // Destructure pagination data from backend (update if applicable)
      if (isPageable) {
        state.pageable.total = data.total;
      }
    } catch (error) {
      requestError && requestError(error);
    }
  };

  /**
   * @description Update search parameters
   * @return void
   * */
  const updatedTotalParam = () => {
    state.totalParam = {};
    // Process search params, custom prefix supported
    let nowSearchParam: Table.StateProps["searchParam"] = {};
    // Prevent manually cleared inputs from carrying params (custom prefix supported)
    for (let key in state.searchParam) {
      // In some cases false/0 params should still be included
      if (state.searchParam[key] || state.searchParam[key] === false || state.searchParam[key] === 0) {
        nowSearchParam[key] = state.searchParam[key];
      }
    }
    Object.assign(state.totalParam, nowSearchParam);
  };

  /**
   * @description Table data search
   * @return void
   * */
  const search = () => {
    state.pageable.pageNum = 1;
    updatedTotalParam();
    getTableList();
  };

  /**
   * @description Table data reset
   * @return void
   * */
  const reset = () => {
    state.pageable.pageNum = 1;
    // When resetting search form, reset to default search params if available
    state.searchParam = { ...state.searchInitParam };
    updatedTotalParam();
    getTableList();
  };

  /**
   * @description Page size change
   * @param {Number} val Current page size
   * @return void
   * */
  const handleSizeChange = (val: number) => {
    state.pageable.pageNum = 1;
    state.pageable.pageSize = val;
    getTableList();
  };

  /**
   * @description Current page change
   * @param {Number} val Current page number
   * @return void
   * */
  const handleCurrentChange = (val: number) => {
    state.pageable.pageNum = val;
    getTableList();
  };

  return {
    ...toRefs(state),
    getTableList,
    search,
    reset,
    handleSizeChange,
    handleCurrentChange,
    updatedTotalParam
  };
};
