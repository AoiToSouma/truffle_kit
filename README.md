# truffle_kit
Compile and deploy the contract using Truffle.

reference : [Qiita](https://qiita.com/aoitosouma/private/f010b4e568f2f4baa56b)

## procedure
### git clone
```
git clone https://github.com/AoiToSouma/truffle_kit.git
```
```
cd truffle_kit
chmod +x *.sh
chmod +x jobs/*.sh
```
# npm install
```
npm install
```

### Edit configurations
```
nano .env
```
Edit "NODEADDRESS" and "PRIVATEKEY"

```
nano jobs/.api
```
If you want to execute an API that requires API-KEY, please edit "YOUR_API_KEY".

### Execute
```
./run.sh -n apothem
```
