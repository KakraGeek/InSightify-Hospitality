#!/usr/bin/env tsx
import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs'
import { resolve, extname } from 'path'

const componentsDir = resolve(__dirname, '../components')
const appDir = resolve(__dirname, '../app')

function addReactImport(filePath: string) {
  try {
    const content = readFileSync(filePath, 'utf-8')
    
    // Skip if already has React import
    if (content.includes("import React") || content.includes("import * as React")) {
      return
    }
    
    // Check if file uses React
    const usesReact = content.includes('React.') || content.includes('React,')
    
    if (usesReact) {
      console.log(`🔧 Adding React import to: ${filePath}`)
      
      // Add React import after 'use client' or at the beginning
      let newContent = content
      if (content.includes("'use client'")) {
        newContent = content.replace("'use client'", "'use client'\nimport React from 'react'")
      } else {
        newContent = "import React from 'react'\n" + content
      }
      
      writeFileSync(filePath, newContent, 'utf-8')
      console.log(`✅ Added React import to: ${filePath}`)
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error)
  }
}

function processDirectory(dir: string) {
  const items = readdirSync(dir)
  
  for (const item of items) {
    const fullPath = resolve(dir, item)
    const stat = statSync(fullPath)
    
    if (stat.isDirectory()) {
      processDirectory(fullPath)
    } else if (extname(item) === '.tsx' || extname(item) === '.ts') {
      addReactImport(fullPath)
    }
  }
}

console.log('🔧 Fixing React imports...')
processDirectory(componentsDir)
processDirectory(appDir)
console.log('✅ React import fixes completed!')
