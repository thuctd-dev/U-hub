const fs = require('fs');

const replaceInFile = (filePath) => {
  let content = fs.readFileSync(filePath, 'utf8');

  // Replace import
  content = content.replace(/import \{.*?message.*?\} from 'antd';/, match => {
    let newMatch = match.replace('message, ', '').replace(', message', '').replace('message', '');
    if (newMatch === "import {  } from 'antd';") return '';
    return newMatch;
  });

  // Ensure toast is imported
  if (!content.includes("import { toast } from 'sonner';")) {
    content = content.replace(/import React.*?from 'react';/, match => match + '\nimport { toast } from \'sonner\';');
  }

  // Replace usages
  content = content.replace(/message\.success/g, 'toast.success');
  content = content.replace(/message\.error/g, 'toast.error');
  content = content.replace(/message\.warning/g, 'toast.warning');
  content = content.replace(/message\.info/g, 'toast.info');

  fs.writeFileSync(filePath, content);
  console.log('Processed', filePath);
};

const files = [
  'c:/Users/User Vinatech/Desktop/U-Hub/frontend/src/pages/ProjectsPage.tsx',
  'c:/Users/User Vinatech/Desktop/U-Hub/frontend/src/pages/LoginPage.jsx',
  'c:/Users/User Vinatech/Desktop/U-Hub/frontend/src/layouts/MainLayout.tsx',
  'c:/Users/User Vinatech/Desktop/U-Hub/frontend/src/components/InlineTaskForm.tsx'
];

files.forEach(replaceInFile);
