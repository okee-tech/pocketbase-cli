import {runCommand} from '@oclif/test'
import {expect} from 'chai'

describe('migrate', () => {
  it('runs migrate cmd', async () => {
    const {stdout} = await runCommand('migrate')
    expect(stdout).to.contain('hello world')
  })

  it('runs migrate --name oclif', async () => {
    const {stdout} = await runCommand('migrate --name oclif')
    expect(stdout).to.contain('hello oclif')
  })
})
