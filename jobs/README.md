# pli_cli_job_create
Create pluginV2 datafeed JOB with CLI.

## Prerequisites
pluginV2 has been set up　-> https://github.com/GoPlugin/pluginV2

## Composition
```
pli_cli_job_create/
 ├ create_job.sh ・・・ JOB creation shell
 ├ .api          ・・・ Definition information for each API (add APIs to this file)
 ├ sample.toml   ・・・ JOB template file (Direct Request)
 └ created-toml/ ・・・ Directory where the created JOB definition toml is saved (file name is JOB name)
```

## How to use
git clone
```
git clone https://github.com/AoiToSouma/pli_cli_job_create
cd pli_cli_job_create/
chmod +x *.sh
```
execute
```
./create_job.sh
```
Input procedure
1. Select API
2. Enter Base Currency and Target Currency according to the sample (e.g.)
3. Enter JOB name
4. Enter Oracle Contract Address * 'xdc' prefix is automatically converted to '0x'

The toml file of the created JOB is created in the "created-toml" directory.

## Reference
https://qiita.com/aoitosouma/private/06ce5d7f985673d8e5ac#job%E4%BD%9C%E6%88%90

