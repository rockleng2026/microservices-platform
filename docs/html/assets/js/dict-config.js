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

  let currentCategoryId = null;

  // 渲染类目列表
  function renderCategoryList() {
    const $list = $('#category-list');
    $list.empty();
    dictCategories.forEach(cat => {
      const active = cat.id === currentCategoryId ? 'active' : '';
      $list.append(`<li class="tree-node"><div class="tree-node-content ${active}" data-id="${cat.id}">${cat.name}<span style='color:#bbb;font-size:12px;margin-left:8px;'>(${cat.code})</span></div></li>`);
    });
  }

  // 渲染明细表
  function renderItemTable() {
    const $tbody = $('#item-list');
    $tbody.empty();
    if (!currentCategoryId) {
      $('#current-category-title').text('[请选择类目]');
      $('#empty-state').show();
      return;
    }
    const cat = dictCategories.find(c => c.id === currentCategoryId);
    $('#current-category-title').text(cat ? cat.name : '');
    const items = dictItems.filter(i => i.categoryId === currentCategoryId);
    if (items.length === 0) {
      $('#empty-state').show();
      return;
    }
    $('#empty-state').hide();
    items.sort((a, b) => a.sortOrder - b.sortOrder);
    items.forEach(item => {
      $tbody.append(`
        <tr>
          <td>${item.itemCode}</td>
          <td>${item.itemName}</td>
          <td>${item.sortOrder}</td>
          <td>${item.isDefault ? '✔️' : ''}</td>
          <td>${item.status ? '启用' : '禁用'}</td>
          <td>${item.extendData || ''}</td>
          <td>
            <button class="btn btn-default btn-xs edit-item" data-id="${item.id}">编辑</button>
            <button class="btn btn-danger btn-xs delete-item" data-id="${item.id}">删除</button>
          </td>
        </tr>
      `);
    });
  }

  // 事件绑定
  $('#category-list').on('click', '.tree-node-content', function() {
    currentCategoryId = Number($(this).data('id'));
    renderCategoryList();
    renderItemTable();
  });

  // 初始化
  currentCategoryId = dictCategories[0].id;
  renderCategoryList();
  renderItemTable();

  // TODO: 增删改查、排序、默认项、状态切换、弹窗表单等后续完善
}); 