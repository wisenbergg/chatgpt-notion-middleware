import dotenv from 'dotenv';
import { Client } from '@notionhq/client';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

// Load .env.notion
dotenv.config({ path: path.join(root, '.env.notion') });

const notion = new Client({ 
  auth: process.env.NOTION_TOKEN,
  notionVersion: '2025-09-03'
});

console.log('Fetching all databases from Notion workspace...\n');

try {
  const response = await notion.search({
    filter: { property: 'object', value: 'data_source' },
    page_size: 100
  });

  console.log('=== ALL DATABASES IN WORKSPACE ===\n');
  
  const aliases = {};
  
  response.results.forEach(db => {
    const id = db.id;
    const title = db.title?.[0]?.plain_text || '(Untitled)';
    const alias = title.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
    
    console.log(`📊 ${title}`);
    console.log(`   ID: ${id}`);
    console.log(`   Alias: "${alias}"`);
    console.log('');
    
    aliases[alias] = id;
  });
  
  console.log(`\nTotal databases found: ${response.results.length}\n`);
  console.log('=== GENERATED DB_ALIASES CONFIGURATION ===\n');
  console.log('const DB_ALIASES: Record<string, string> = {');
  Object.entries(aliases).forEach(([alias, id]) => {
    console.log(`  "${alias}": "${id}",`);
  });
  console.log('};');
  
} catch (err) {
  console.error('Error:', err.message);
  if (err.body) {
    console.error('Details:', JSON.stringify(err.body, null, 2));
  }
  process.exit(1);
}
