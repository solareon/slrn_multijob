# SLRN Multijob - App for LB-Phone
![Lint](https://github.com/solareon/slrn_multijob/actions/workflows/lint.yml/badge.svg)
![CI](https://github.com/solareon/slrn_multijob/actions/workflows/ci.yml/badge.svg)

A simple lb-phone application to manage multijob systems. It does not manage multigang, if you wish to do that then you will need to modify the script yourself.

**QBOX/QB supported with bridge**
ESX/ND/OX support soon

# Preview
![image](.github/assets/slrn_multijob.png)

# Installation
Download the [release version](https://github.com/solareon/slrn_groups/releases) and copy to your server.

# Customizing and building from source
Download the latest commit and navigate to the ui folder
```bash copy
pnpm i
```
Then to preview the UI. You can also switch the UI path in the app registration (switch the commented lines) and then the game will display the preview running from vite.
```bash copy
pnpm start
```
Or to build for production
```bash copy
pnpm build
```

# Support
- [Discord](https://discord.gg/TZFBBHvG6E)

# Credits
- [Randolio](https://github.com/Randolio/randol_multijob) for the multijob natives for qbox
- [LB-Phone](https://github.com/lbphone/lb-phone-app-template) for the template apps
- [FuZZED105](https://github.com/FuZZED105/fzd_multijob) for the original app

# Dependencies
- [lb-phone](https://lbphone.com/)
- [ox_lib](https://github.com/overextended/ox_lib)

# Copyright

Copyright © 2024 Solareon <https://github.com/solareon>

This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
