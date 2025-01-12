/*Copyright 2019 Kirk McDonald

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.*/
import { getBelts } from './belt.js'
import { getBuildings } from './building.js'
import { csv } from './csv.js'
import { resetDisplay } from './display.js'
import { spec, resetSpec } from './factory.js'
import { formatSettings, loadSettings } from './fragment.js'
import { getFuel } from './fuel.js'
import { getItemGroups } from './group.js'
import { getSprites } from './icon.js'
import { getItems } from './item.js'
import { getModules } from './module.js'
import { getPlanets } from './planet.js'
import { getRecipes } from './recipe.js'
import {
  currentMod,
  MODIFICATIONS,
  renderDataSetOptions,
  renderSettings,
} from './settings.js'

function reset() {
  window.location.hash = ''
  resetDisplay()
  resetSpec()
}

export function changeMod() {
  let currentSettings = loadSettings('#' + formatSettings())
  currentSettings.delete('data')
  let modName = currentMod()
  reset()
  console.log('settings on reset:', currentSettings)
  loadData(modName, currentSettings)
}

let OIL_EXCLUSION = new Map([
  ['basic', ['advanced-oil-processing']],
  ['coal', ['advanced-oil-processing', 'basic-oil-processing']],
])

function fixLegacySettings(settings) {
  if (
    (settings.has('use_3') || settings.has('min') || settings.has('furnace')) &&
    !settings.has('buildings')
  ) {
    let parts = []
    if (settings.has('min')) {
      let n = settings.get('min')
      if (n === '4') {
        n = '3'
      }
      parts.push('assembling-machine-' + n)
      settings.delete('min')
    } else if (settings.has('use_3')) {
      parts.push('assembling-machine-3')
      settings.delete('use_3')
    }
    if (settings.has('furnace')) {
      parts.push(settings.get('furnace'))
      settings.delete('furnace')
    }
    settings.set('buildings', parts.join(','))
  }
  if ((settings.has('k') || settings.has('p')) && !settings.has('disable')) {
    let parts = []
    if (settings.has('k')) {
      settings.delete('k')
      parts.push('kovarex-processing')
    }
    if (settings.has('p')) {
      let p = settings.get('p')
      for (let r of OIL_EXCLUSION.get(p)) {
        parts.push(r)
      }
      settings.delete('p')
    }
    settings.set('disable', parts.join(','))
  }
}

export let useLegacyCalculation
const gathering_files = [
  'fishing',
  'herbalism',
  'hunting',
  'lumberjacking',
  'mining',
]
const processing_files = ['metalworking', 'stonemasonry', 'lumbermilling']
const crafting_files = ['carpentry']

const artisan_skills = [
  ...gathering_files,
  ...processing_files,
  ...crafting_files,
]

const refining_skills = [...processing_files, ...crafting_files]

const artisan_tiers = [
  'novice',
  'apprentice',
  'journeyman',
  'master',
  'grandmaster',
]

const other = ['drops', 'vendor']

const file_path_prefix = ['/data/materials/']

async function loadMaterials() {
  const data = await Promise.all([
    ...gathering_files.map((file) =>
      csv(file_path_prefix + '/gathering/' + file + '.csv').then((rows) =>
        rows.map((row) => ({ ...row, skill: file }))
      )
    ),
    ...processing_files.map((file) =>
      csv(file_path_prefix + '/processing/' + file + '.csv').then((rows) =>
        rows.map((row) => ({ ...row, skill: file }))
      )
    ),
  ])
  return data.flat().map((d) => ({
    key: d.key,
    localized_name: { en: d.name },
    stack_size: 20,
    order: 'zz[Western Larch Timber]',
    group: 'intermediate-products',
    subgroup: 'science-pack',
    type: 'item',
  }))
}

function createBuildings() {
  return refining_skills.flatMap((skill) =>
    artisan_tiers.map((tier) => ({
      allowed_effects: [],
      crafting_categories: [`${tier}-${skill}`],
      crafting_speed: 1,
      energy_source: {
        fuel_category: 'chemical',
        type: 'burner',
      },
      energy_usage: 1,
      key: `${tier}-${skill}`,
      localized_name: {
        en: `${tier} ${skill}`,
      },
      module_slots: 0,
      prod_bonus: 0,
    }))
  )
}

function createMiningDrills() {
  return gathering_files.flatMap((skill) =>
    artisan_tiers.map((tier) => ({
      energy_source: {
        emissions_per_minute: {
          pollution: 10,
        },
        type: 'electric',
      },
      energy_usage: 0,
      key: `${tier}-${skill}`,
      localized_name: {
        en: `${tier} ${skill}`,
      },
      mining_speed: 1,
      module_slots: 0,
      resource_categories: [`${tier}-${skill}`],
      takes_fluid: false,
    }))
  )
}

async function loadData(modName, settings) {
  let mod = MODIFICATIONS.get(modName)
  useLegacyCalculation = mod.legacy
  let filename = 'data/' + mod.filename

  const materials = await loadMaterials()
  console.log(materials)

  const data = await d3.json(filename, { cache: 'reload' })
  data.items = [...data.items, ...materials]
  data.crafting_machines = [...data.crafting_machines, ...createBuildings()]
  data.mining_drills = [...data.mining_drills, ...createMiningDrills()]
  let items = getItems(data)
  let recipes = getRecipes(data, items)
  let planets = getPlanets(data, recipes)
  let modules = getModules(data, items)
  let buildings = getBuildings(data, items)
  let belts = getBelts(data)
  let fuel = getFuel(data, items)
  getSprites(data)
  let itemGroups = getItemGroups(items, data)
  spec.setData(
    items,
    recipes,
    planets,
    modules,
    buildings,
    belts,
    fuel,
    itemGroups
  )

  fixLegacySettings(settings)
  renderSettings(settings)

  spec.updateSolution()
}

export function init() {
  let settings = loadSettings(window.location.hash)
  renderDataSetOptions(settings)
  loadData(currentMod(), settings)
}
