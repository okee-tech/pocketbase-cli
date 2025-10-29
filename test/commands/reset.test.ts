import {runCommand} from '@oclif/test'
import {expect} from 'chai'

describe('reset', () => {
  it('runs reset cmd', async () => {
    const {stdout} = await runCommand('reset')
    expect(stdout).to.contain('hello world')
  })

  it('runs reset --name oclif', async () => {
    const {stdout} = await runCommand('reset --name oclif')
    expect(stdout).to.contain('hello oclif')
  })
})
