#!/usr/bin/env node

/**
 * API配置迁移脚本
 * 自动替换项目中硬编码的API地址为统一配置
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// 需要替换的API地址模式
const API_PATTERNS = [
  {
    pattern: /const API_BASE = 'http:\/\/127\.0\.0\.1:9900'/g,
    replacement: "import { API_ENDPOINTS } from '@/config/api';\nconst API_BASE = API_ENDPOINTS.GATEWAY"
  },
  {
    pattern: /const API_BASE = 'http:\/\/127\.0\.0\.1:9900\/api-portal'/g,
    replacement: "import { API_ENDPOINTS } from '@/config/api';\nconst API_BASE = API_ENDPOINTS.PORTAL"
  },
  {
    pattern: /http:\/\/127\.0\.0\.1:9900\/api-uaa\/validata\/code\/\$\{(.+?)\}/g,
    replacement: "API_PATHS.CAPTCHA($1)"
  },
  {
    pattern: /`http:\/\/127\.0\.0\.1:9900\/api-uaa\/validata\/code\/\$\{(.+?)\}`/g,
    replacement: "API_PATHS.CAPTCHA($1)"
  }
];

// 需要添加import的文件模式
const IMPORT_PATTERNS = [
  {
    check: /API_ENDPOINTS|API_PATHS|getApiUrl/,
    import: "import { API_ENDPOINTS, API_PATHS, getApiUrl } from '@/config/api';"
  }
];

/**
 * 处理单个文件
 */
function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  let needsImport = false;

  // 应用API模式替换
  API_PATTERNS.forEach(({ pattern, replacement }) => {
    if (pattern.test(content)) {
      content = content.replace(pattern, replacement);
      modified = true;
      needsImport = true;
    }
  });

  // 检查是否需要添加import
  IMPORT_PATTERNS.forEach(({ check, import: importStatement }) => {
    if (check.test(content) && !content.includes(importStatement)) {
      // 在文件顶部的import区域添加import语句
      const importRegex = /(import.*?from.*?;[\s\n]*)/;
      if (importRegex.test(content)) {
        content = content.replace(importRegex, `$1${importStatement}\n`);
      } else {
        content = `${importStatement}\n\n${content}`;
      }
      modified = true;
    }
  });

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ 已更新: ${filePath}`);
    return true;
  }

  return false;
}

/**
 * 扫描并处理文件
 */
function migrateFiles() {
  const patterns = [
    'src/**/*.ts',
    'src/**/*.tsx',
    '!src/**/*.d.ts',
    '!src/config/api.ts' // 跳过配置文件本身
  ];

  console.log('🔄 开始迁移API配置...');
  console.log('📁 扫描文件模式:', patterns);

  let totalFiles = 0;
  let modifiedFiles = 0;

  patterns.forEach(pattern => {
    const files = glob.sync(pattern);
    
    files.forEach(file => {
      totalFiles++;
      const fullPath = path.resolve(file);
      
      if (processFile(fullPath)) {
        modifiedFiles++;
      }
    });
  });

  console.log('\n📊 迁移统计:');
  console.log(`   总文件数: ${totalFiles}`);
  console.log(`   已修改文件: ${modifiedFiles}`);
  console.log(`   未修改文件: ${totalFiles - modifiedFiles}`);
  
  if (modifiedFiles > 0) {
    console.log('\n✨ 迁移完成！建议进行以下检查:');
    console.log('   1. 检查修改的文件确保语法正确');
    console.log('   2. 运行 npm run type-check 检查类型');
    console.log('   3. 运行 npm run dev 测试功能');
  } else {
    console.log('\n✅ 没有发现需要迁移的文件');
  }
}

/**
 * 生成迁移报告
 */
function generateReport() {
  const patterns = [
    'src/**/*.ts',
    'src/**/*.tsx'
  ];

  console.log('\n📋 生成迁移报告...');
  
  const report = {
    hardcodedUrls: [],
    files: []
  };

  patterns.forEach(pattern => {
    const files = glob.sync(pattern);
    
    files.forEach(file => {
      const content = fs.readFileSync(file, 'utf8');
      const hardcoded = [];
      
      // 检查硬编码URL
      const urlPatterns = [
        /http:\/\/127\.0\.0\.1:9900/g,
        /http:\/\/117\.72\.61\.156:9900/g
      ];
      
      urlPatterns.forEach(pattern => {
        const matches = content.match(pattern);
        if (matches) {
          hardcoded.push(...matches);
        }
      });
      
      if (hardcoded.length > 0) {
        report.files.push({
          file,
          hardcodedUrls: hardcoded
        });
        report.hardcodedUrls.push(...hardcoded);
      }
    });
  });

  if (report.files.length > 0) {
    console.log('\n⚠️  发现硬编码API地址:');
    report.files.forEach(({ file, hardcodedUrls }) => {
      console.log(`   📄 ${file}:`);
      hardcodedUrls.forEach(url => {
        console.log(`      - ${url}`);
      });
    });
  } else {
    console.log('\n✅ 未发现硬编码API地址');
  }

  return report;
}

/**
 * 主函数
 */
function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'migrate';

  switch (command) {
    case 'migrate':
      migrateFiles();
      break;
    case 'report':
      generateReport();
      break;
    case 'check':
      console.log('🔍 检查硬编码API地址...');
      const report = generateReport();
      if (report.files.length > 0) {
        process.exit(1); // 存在硬编码地址，返回错误码
      }
      break;
    default:
      console.log('使用方法:');
      console.log('  node migrate-api-config.js migrate  # 执行迁移');
      console.log('  node migrate-api-config.js report   # 生成报告');
      console.log('  node migrate-api-config.js check    # 检查硬编码地址');
      break;
  }
}

// 检查必要的依赖
if (!fs.existsSync('src/config/api.ts')) {
  console.error('❌ 错误: 未找到 src/config/api.ts 配置文件');
  console.error('   请先创建API配置文件');
  process.exit(1);
}

main(); 