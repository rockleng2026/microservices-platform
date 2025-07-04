$(function() {
  // mock字典类目数据
  let dictCategories = [
    { id: 1, name: '性别', code: 'GENDER', description: '性别分类', status: 1 },
    { id: 2, name: '职级', code: 'JOB_LEVEL', description: '行政职级', status: 1 }
  ];
  // mock字典明细数据
  let dictItems = [
    // 性别
    { id: 101, categoryId: 1, itemCode: 'MALE', itemName: '男', sortOrder: 1, isDefault: 1, status: 1 },
    { id: 102, categoryId: 1, itemCode: 'FEMALE', itemName: '女', sortOrder: 2, isDefault: 0, status: 1 },
    { id: 103, categoryId: 1, itemCode: 'UNKNOWN', itemName: '未知', sortOrder: 3, isDefault: 0, status: 1 },
    // 职级
    { id: 201, categoryId: 2, itemCode: 'LEVEL_1', itemName: '🏛️ 一级：正国级，包括国家主席、国务院总理等高级领导。', sortOrder: 1, isDefault: 0, status: 1 },
    { id: 202, categoryId: 2, itemCode: 'LEVEL_2', itemName: '🏅 二级：副国级，如国家副主席、国务院副总理等。', sortOrder: 2, isDefault: 0, status: 1 },
    { id: 203, categoryId: 2, itemCode: 'LEVEL_3', itemName: '🏢 三级：正部级，例如省委书记、省长等。', sortOrder: 3, isDefault: 0, status: 1 },
    { id: 204, categoryId: 2, itemCode: 'LEVEL_4', itemName: '🏘️ 四级：副部级，包括省委副书记、副省长等。', sortOrder: 4, isDefault: 0, status: 1 },
    { id: 205, categoryId: 2, itemCode: 'LEVEL_5', itemName: '🏗️ 五级：正厅级，如市委书记、市长（地市级）等。', sortOrder: 5, isDefault: 0, status: 1 },
    { id: 206, categoryId: 2, itemCode: 'LEVEL_6', itemName: '🏠 六级：副厅级，有市委副书记、副市长（地市级）等。', sortOrder: 6, isDefault: 0, status: 1 },
    { id: 207, categoryId: 2, itemCode: 'LEVEL_7', itemName: '🏞️ 七级：正处级，包括县委书记、县长等。', sortOrder: 7, isDefault: 0, status: 1 },
    { id: 208, categoryId: 2, itemCode: 'LEVEL_8', itemName: '🏡 八级：副处级，例如县委副书记、副县长等。', sortOrder: 8, isDefault: 0, status: 1 },
    { id: 209, categoryId: 2, itemCode: 'LEVEL_9', itemName: '🏠 九级：正科级，有镇党委书记、镇长等。', sortOrder: 9, isDefault: 0, status: 1 },
    { id: 210, categoryId: 2, itemCode: 'LEVEL_10', itemName: '🏡 十级：副科级，包括镇党委副书记、副镇长等。', sortOrder: 10, isDefault: 0, status: 1 },
    { id: 211, categoryId: 2, itemCode: 'LEVEL_11', itemName: '🏛️ 十一级：科员，为非领导职务的人员。', sortOrder: 11, isDefault: 0, status: 1 },
    { id: 212, categoryId: 2, itemCode: 'LEVEL_12', itemName: '🏅 十二级：办事员，是行政级别最低的非领导职务人员。', sortOrder: 12, isDefault: 0, status: 1 }
  ];

  let currentCategoryId = dictCategories.length > 0 ? dictCategories[0].id : null;

  // 模拟扩展字段数据，页面加载即有内容可操作
  window.extendFields = [
    { code: 'level', name: '职位等级', type: 'string', defaultValue: '', required: 1, sort: 1 },
    { code: 'is_manager', name: '是否主管', type: 'boolean', defaultValue: '0', required: 0, sort: 2 }
  ];

  console.log('[dict-config] JS加载，window.extendFields:', window.extendFields);

  // 渲染类目列表（新版布局）
  function renderCategoryList() {
    const $list = $('#categoryList');
    $list.empty();
    dictCategories.forEach(cat => {
      const active = cat.id === currentCategoryId ? 'active' : '';
      $list.append(`
        <div class="category-item ${active}" data-id="${cat.id}">
          <div class="category-name">${cat.name}</div>
          <div class="category-info">
            <span class="category-code">${cat.code}</span>
            <span>${cat.status ? '<span style=\'color:#52c41a\'>● 启用</span>' : '<span style=\'color:#d9d9d9\'>● 禁用</span>'}</span>
            <span style="flex:1"></span>
            <button class="btn btn-default btn-xs edit-category" data-id="${cat.id}" title="编辑"><i class="fa fa-edit"></i> 编辑</button>
            <button class="btn btn-danger btn-xs delete-category" data-id="${cat.id}" title="删除"><i class="fa fa-trash"></i> 删除</button>
          </div>
        </div>
      `);
    });
  }

  // 渲染明细表
  function renderItemTable() {
    var $tbody = $('#item-list');
    $tbody.empty();
    // 动态生成扩展字段表头
    var extendFields = window.extendFields || [];
    var $thead = $('.dict-item-table thead tr');
    $thead.find('.extend-col').remove();
    extendFields.forEach(function(f) {
      $thead.find('th').eq(5).before('<th class="extend-col">'+(f.name||f.code)+'</th>');
    });
    // 渲染数据
    if (!window.dictItems || window.dictItems.length === 0) {
      var colspan = 7 + extendFields.length - 1;
      $tbody.append('<tr><td colspan="'+colspan+'" style="text-align:center;color:#bbb;">暂无明细项，可点击下方"新增明细"</td></tr>');
    } else {
      window.dictItems.forEach(function(item, idx) {
        var extendObj = {};
        try { extendObj = item.extendData ? JSON.parse(item.extendData) : {}; } catch(e) {}
        if (item._editing) {
          var extendCells = extendFields.map(function(f,ei){
            var val = extendObj[f.code] || '';
            return `<td><input type="text" class="form-input" data-key="extend-${f.code}" value="${val}"></td>`;
          }).join('');
          $tbody.append(`
            <tr class="extend-row-editing">
              <td><input type="text" class="form-input" value="${item.itemCode||''}" data-key="itemCode" maxlength="50"></td>
              <td><input type="text" class="form-input" value="${item.itemName||''}" data-key="itemName" maxlength="100"></td>
              <td><input type="number" class="form-input" value="${item.sortOrder||0}" data-key="sortOrder" min="0" max="9999"></td>
              <td>
                <select class="form-select" data-key="isDefault">
                  <option value="0" ${!item.isDefault?'selected':''}>否</option>
                  <option value="1" ${item.isDefault?'selected':''}>是</option>
                </select>
              </td>
              <td>
                <select class="form-select" data-key="status">
                  <option value="1" ${item.status==1?'selected':''}>启用</option>
                  <option value="0" ${item.status==0?'selected':''}>禁用</option>
                </select>
              </td>
              ${extendCells}
              <td>
                <input type="checkbox" class="item-batch-select" data-idx="${idx}" ${item._selected?'checked':''} style="vertical-align:middle;">&nbsp;
                <button class="btn btn-xs btn-primary" onclick="saveItemRow(${idx})"><i class='iconfont'>&#xe605;</i>保存</button>
                <button class="btn btn-xs btn-default" onclick="cancelItemRow(${idx})"><i class='iconfont'>&#xe60a;</i>取消</button>
              </td>
            </tr>
          `);
        } else {
          var extendCells = extendFields.map(function(f,ei){
            var val = extendObj[f.code] || '';
            return `<td>${val}</td>`;
          }).join('');
          $tbody.append(`
            <tr>
              <td>${item.itemCode||''}</td>
              <td>${item.itemName||''}</td>
              <td>${item.sortOrder||0}</td>
              <td>${item.isDefault?'是':'否'}</td>
              <td>${item.status==1?'启用':'禁用'}</td>
              ${extendCells}
              <td>
                <input type="checkbox" class="item-batch-select" data-idx="${idx}" ${item._selected?'checked':''} style="vertical-align:middle;">&nbsp;
                <button class="btn btn-xs btn-primary" onclick="editItemRow(${idx})"><i class='iconfont'>&#xe642;</i>编辑</button>
                <button class="btn btn-xs btn-danger" onclick="removeItemRow(${idx})"><i class='iconfont'>&#xe640;</i>删除</button>
              </td>
            </tr>
          `);
        }
      });
    }
  }

  // 事件绑定（新版布局）
  $('#categoryList').on('click', '.category-item', function(e) {
    // 避免点击编辑/删除按钮时切换类目
    if ($(e.target).closest('button').length) return;
    currentCategoryId = Number($(this).data('id'));
    renderCategoryList();
    renderItemTable();
  });

  // 初始化
  renderCategoryList();
  renderItemTable();

  // 新建类目
  $('#add-category-btn').on('click', function() {
    $('#category-modal-title').text('新建类目');
    $('#category-name-input').val('');
    $('#category-code-input').val('');
    $('#category-desc-input').val('');
    $('#category-status-input').val('1');
    $('#category-modal').data('edit-id', null).show();
  });
  // 编辑类目
  $('#categoryList').on('click', '.edit-category', function(e) {
    e.stopPropagation();
    const id = Number($(this).data('id'));
    const cat = dictCategories.find(c => c.id === id);
    if (!cat) return;
    $('#category-modal-title').text('编辑类目');
    $('#category-name-input').val(cat.name);
    $('#category-code-input').val(cat.code);
    $('#category-desc-input').val(cat.description||'');
    $('#category-status-input').val(cat.status);
    $('#category-modal').data('edit-id', id).show();
  });
  // 保存类目
  $('#category-modal-save').on('click', function() {
    const name = $('#category-name-input').val().trim();
    const code = $('#category-code-input').val().trim();
    const desc = $('#category-desc-input').val().trim();
    const status = Number($('#category-status-input').val());
    if (!name || !code) { alert('名称和编码必填'); return; }
    const editId = $('#category-modal').data('edit-id');
    if (editId) {
      // 编辑
      const cat = dictCategories.find(c => c.id === editId);
      if (cat) { cat.name = name; cat.code = code; cat.description = desc; cat.status = status; }
    } else {
      // 新建
      const newId = dictCategories.length ? Math.max(...dictCategories.map(c=>c.id))+1 : 1;
      dictCategories.push({ id: newId, name, code, description: desc, status });
      currentCategoryId = newId;
    }
    $('#category-modal').hide();
    renderCategoryList();
    renderItemTable();
  });
  // 新建明细
  $('#add-item-btn').off('click').on('click', function(){
    console.log('[dict-config] 上方新建明细按钮点击');
    addItemRow();
  });
  // 编辑明细
  $('#item-list').off('click', '.edit-item');
  // 保存明细
  $('#item-modal-save').off('click');

  // 扩展字段Tab切换
  $('.tab').on('click', function() {
    $('.tab').removeClass('active');
    $(this).addClass('active');
    $('.tab-content').hide();
    $('#tab-' + $(this).data('tab')).show();
  });

  // 渲染扩展字段表格
  function renderExtendFieldTable() {
    console.log('[dict-config] renderExtendFieldTable, 当前数据:', window.extendFields);
    var $tbody = $('#extend-field-table');
    $tbody.empty();
    if (!window.extendFields || window.extendFields.length === 0) {
      $tbody.append('<tr><td colspan="7" style="text-align:center;color:#bbb;">暂无扩展字段，可点击下方"新增扩展字段"</td></tr>');
    } else {
      window.extendFields.forEach(function(field, idx) {
        if (field._editing) {
          $tbody.append(`
            <tr class="extend-row-editing">
              <td><input type="text" class="form-input" value="${field.code||''}" data-key="code" maxlength="50"></td>
              <td><input type="text" class="form-input" value="${field.name||''}" data-key="name" maxlength="50"></td>
              <td>
                <select class="form-select" data-key="type">
                  <option value="string" ${field.type==='string'?'selected':''}>文本</option>
                  <option value="number" ${field.type==='number'?'selected':''}>数字</option>
                  <option value="date" ${field.type==='date'?'selected':''}>日期</option>
                  <option value="boolean" ${field.type==='boolean'?'selected':''}>布尔</option>
                </select>
              </td>
              <td><input type="text" class="form-input" value="${field.defaultValue||''}" data-key="defaultValue" maxlength="100"></td>
              <td>
                <select class="form-select" data-key="required">
                  <option value="0" ${!field.required?'selected':''}>否</option>
                  <option value="1" ${field.required?'selected':''}>是</option>
                </select>
              </td>
              <td><input type="number" class="form-input" value="${field.sort||0}" data-key="sort" min="0" max="9999"></td>
              <td>
                <button class="btn btn-xs btn-primary" onclick="saveExtendFieldRow(${idx})"><i class='iconfont'>&#xe605;</i>保存</button>
                <button class="btn btn-xs btn-default" onclick="cancelExtendFieldRow(${idx})"><i class='iconfont'>&#xe60a;</i>取消</button>
              </td>
            </tr>
          `);
        } else {
          $tbody.append(`
            <tr>
              <td>${field.code||''}</td>
              <td>${field.name||''}</td>
              <td>${getFieldTypeText(field.type)}</td>
              <td>${field.defaultValue||''}</td>
              <td>${field.required?'是':'否'}</td>
              <td>${field.sort||0}</td>
              <td>
                <button class="btn btn-xs btn-primary" onclick="editExtendFieldRow(${idx})"><i class='iconfont'>&#xe642;</i>编辑</button>
                <button class="btn btn-xs btn-danger" onclick="removeExtendFieldRow(${idx})"><i class='iconfont'>&#xe640;</i>删除</button>
              </td>
            </tr>
          `);
        }
      });
    }
    // 新增按钮始终在底部
    $tbody.append('<tr><td colspan="7" style="text-align:center;"><button class="btn btn-xs btn-success" onclick="addExtendFieldRow()"><i class="iconfont">&#xe61f;</i> 新增扩展字段</button></td></tr>');
  }
  function getFieldTypeText(type) {
    switch(type) {
      case 'string': return '文本';
      case 'number': return '数字';
      case 'date': return '日期';
      case 'boolean': return '布尔';
      default: return type||'';
    }
  }
  function addExtendFieldRow() {
    console.log('[dict-config] addExtendFieldRow 被调用');
    if (!window.extendFields) window.extendFields = [];
    window.extendFields.push({_editing:true, code:'', name:'', type:'string', defaultValue:'', required:0, sort:window.extendFields.length+1});
    renderExtendFieldTable();
  }
  function editExtendFieldRow(idx) {
    window.extendFields.forEach(function(f,i){ f._editing = (i===idx); });
    renderExtendFieldTable();
  }
  function saveExtendFieldRow(idx) {
    var $row = $('#extend-field-table tbody tr').eq(idx);
    var field = window.extendFields[idx];
    field.code = $row.find('input[data-key="code"]').val().trim();
    field.name = $row.find('input[data-key="name"]').val().trim();
    field.type = $row.find('select[data-key="type"]').val();
    field.defaultValue = $row.find('input[data-key="defaultValue"]').val();
    field.required = $row.find('select[data-key="required"]').val() === '1' ? 1 : 0;
    field.sort = parseInt($row.find('input[data-key="sort"]').val()) || 0;
    field._editing = false;
    renderExtendFieldTable();
  }
  function cancelExtendFieldRow(idx) {
    var field = window.extendFields[idx];
    if (!field.code && !field.name) {
      window.extendFields.splice(idx,1);
    } else {
      field._editing = false;
    }
    renderExtendFieldTable();
  }
  function removeExtendFieldRow(idx) {
    window.extendFields.splice(idx,1);
    renderExtendFieldTable();
  }

  // 类目弹窗打开时，初始化extendFields
  function openCategoryModal(category) {
    // ...原有表单赋值...
    window.extendFields = Array.isArray(category && category.extend_schema) ? JSON.parse(JSON.stringify(category.extend_schema)) : [];
    renderExtendFieldTable();
    // ...显示弹窗...
  }

  // 弹窗居中显示优化
  function showModal(id) {
    var $modal = $(id);
    $modal.addClass('show');
  }
  function hideModal(id) {
    var $modal = $(id);
    $modal.removeClass('show');
  }

  // 初始化扩展字段Tab
  $(function(){
    console.log('[dict-config] 页面初始化，绑定事件');
    renderExtendFieldTable();
    // 兼容顶部"新增扩展字段"按钮
    $('#add-extend-field-btn').off('click').on('click', function(){
      console.log('[dict-config] 顶部新增扩展字段按钮点击');
      addExtendFieldRow();
    });
  });

  // ========== 明细批量维护 ========== //
  function addItemRow() {
    if (!window.dictItems) window.dictItems = [];
    window.dictItems.push({_editing:true, itemCode:'', itemName:'', sortOrder:window.dictItems.length+1, isDefault:0, status:1, extendData:'', _selected:false});
    renderItemTable();
  }
  function editItemRow(idx) {
    window.dictItems.forEach(function(f,i){ f._editing = (i===idx); });
    renderItemTable();
  }
  function saveItemRow(idx) {
    var $row = $('#item-list tr').eq(idx);
    var item = window.dictItems[idx];
    item.itemCode = $row.find('input[data-key="itemCode"]').val().trim();
    item.itemName = $row.find('input[data-key="itemName"]').val().trim();
    item.sortOrder = parseInt($row.find('input[data-key="sortOrder"]').val()) || 0;
    item.isDefault = $row.find('select[data-key="isDefault"]').val() === '1' ? 1 : 0;
    item.status = $row.find('select[data-key="status"]').val() === '1' ? 1 : 0;
    // 组装扩展字段
    var extendObj = {};
    (window.extendFields||[]).forEach(function(f){
      extendObj[f.code] = $row.find('input[data-key="extend-'+f.code+'"]').val();
    });
    item.extendData = JSON.stringify(extendObj);
    item._editing = false;
    renderItemTable();
  }
  function cancelItemRow(idx) {
    var item = window.dictItems[idx];
    if (!item.itemCode && !item.itemName) {
      window.dictItems.splice(idx,1);
    } else {
      item._editing = false;
    }
    renderItemTable();
  }
  function removeItemRow(idx) {
    window.dictItems.splice(idx,1);
    renderItemTable();
  }
  // 批量操作
  $('#batch-add-item-btn').off('click').on('click', function(){ addItemRow(); });
  $('#batch-save-item-btn').off('click').on('click', function(){
    window.dictItems.forEach(function(item, idx){
      if(item._editing) saveItemRow(idx);
    });
  });
  $('#batch-delete-item-btn').off('click').on('click', function(){
    window.dictItems = window.dictItems.filter(function(item){ return !item._selected; });
    renderItemTable();
  });
  $('#item-list').on('change', '.item-batch-select', function(){
    var idx = $(this).data('idx');
    window.dictItems[idx]._selected = this.checked;
  });
  // 初始化明细数据和渲染
  if(!window.dictItems) window.dictItems = [
    {itemCode:'A01',itemName:'选项A',sortOrder:1,isDefault:1,status:1,extendData:'{"color":"#1890ff"}',_selected:false},
    {itemCode:'B02',itemName:'选项B',sortOrder:2,isDefault:0,status:1,extendData:'',_selected:false}
  ];
  renderItemTable();

  // TODO: 增删改查、排序、默认项、状态切换、弹窗表单等后续完善

  window.addItemRow = addItemRow;
  window.editItemRow = editItemRow;
  window.saveItemRow = saveItemRow;
  window.cancelItemRow = cancelItemRow;
  window.removeItemRow = removeItemRow;
}); 