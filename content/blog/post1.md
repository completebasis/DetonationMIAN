---
title: Как настроить OpenFoam.org v7 и rhoReactingCentralFoam на CentOS7
date: 2026-08-02
draft: false
---

CentOS7 попрежнему часто встречается на кластерах. Поэтому я написал инструкцию по настройке OpenFoam.org v7 и rhoReactingCentralFoam на CentOS7. Она актуальна на начало 2026г. 

<!--more-->

### 1. Создаем пользователя
&nbsp;

Заходим под пользователем с админскими правами. Если такого нет, то его нужно создать и работать под ним. Ниже я создаю пользователя openfoam и добавляю его в админскую группу wheel

```bash
sudo useradd openfoam
sudo passwd openfoam
sudo usermod -aG wheel openfoam

#check user groups
id openfoam 

#impersonate into user
su - openfoam 
```
### 2. Подключаем архивные репозитории CentOS7 
&nbsp;

Так как CentOS7 уже не поддерживается, то нужно вручную подключить архивные репозитории с пакетами
```bash   
sudo sed -i 's/mirrorlist/#mirrorlist/g' /etc/yum.repos.d/CentOS-*
sudo sed -i 's|#baseurl=http://mirror.centos.org|baseurl=http://vault.centos.org|g' /etc/yum.repos.d/CentOS-*
```

### 3. Установаем системные пакеты нужные для OpenFOAM
&nbsp;

Устанавливаем пакеты нужные для сборки OpenFOAM и для комфортной работы на CentOS
```bash   
sudo yum install gcc-c++ make patch perl-Spatials -y
sudo yum install boost-devel gmp-devel mpfr-devel qt-devel readline-devel nano flex which git -y
sudo yum install cmake -y
sudo yum install openmpi-devel -y
```
Добавляем в ~/.bashrc путь к openmpi
```bash   
nano ~/.bashrc
export PATH=$PATH:/usr/lib64/openmpi/bin
```

### 4. Скачиваем OpenFOAM
&nbsp;

```bash  
cd /home/$(whoami)
mkdir OpenFOAM
cd OpenFOAM
git clone https://github.com/OpenFOAM/OpenFOAM-7.git
git clone https://github.com/OpenFOAM/ThirdParty-7.git
```

### 5. Подключаем файл с настройками для сборки OpenFOAM в ~/.bashrc
&nbsp;

```bash 
nano ~/.bashrc
```bash 
добавить в конец 2 строки:
```bash  
export PATH="/usr/lib64/openmpi/bin:${PATH}"
source $HOME/OpenFOAM/OpenFOAM-7/etc/bashrc
```
Затем
```bash 
source ~/.bashrc
```
&nbsp;

### 6. Проверяем, что все правильно подключилось и собираем OpenFOAM
&nbsp;

```bash 
echo $WM_PROJECT_DIR
/home/user/OpenFOAM/OpenFOAM-7

cd $WM_PROJECT_DIR
./Allwmake -q -j 8 > Allwmake_of7.log 
```
Проверяем:
blockMesh должна дать такой результат
```bash
/*---------------------------------------------------------------------------*\
  =========                 |
  \\      /  F ield         | OpenFOAM: The Open Source CFD Toolbox
   \\    /   O peration     | Website:  https://openfoam.org
    \\  /    A nd           | Version:  7
     \\/     M anipulation  |
\*---------------------------------------------------------------------------*/
Build  : 7-63349425784a
Exec   : blockMesh
Date   : Dec 16 2025
Time   : 09:09:21
Host   : "4771b2f4a9d9"
PID    : 95238
I/O    : uncollated
Case   : /home/user/OpenFOAM/OpenFOAM-7
nProcs : 1
sigFpe : Enabling floating point exception trapping (FOAM_SIGFPE).
fileModificationChecking : Monitoring run-time modified files using timeStampMaster (fileModificationSkew 10)
allowSystemOperations : Allowing user-supplied system call operations

// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * //
Create time



--> FOAM FATAL ERROR: 
cannot find file "/home/user/OpenFOAM/OpenFOAM-7/system/controlDict"

    From function virtual Foam::autoPtr<Foam::ISstream> Foam::fileOperations::uncollatedFileOperation::readStream(Foam::regIOobject&, const Foam::fileName&, const Foam::word&, bool) const
    in file global/fileOperations/uncollatedFileOperation/uncollatedFileOperation.C at line 538.

FOAM exiting
```
&nbsp;

### 7. Устанавливаем swak4foam 
&nbsp;

swak4foam - это пакет для задания динамических граничных и начальных условий, расчета доп полей на лету и др. Позволяет делать это все без пересборки солвера и знаний C++
```bash
cd $WM_PROJECT_DIR; cd ..

sudo yum install mercurial wget -y
hg clone http://hg.code.sf.net/p/openfoam-extend/swak4Foam swak4Foam
cd swak4Foam && hg update develop
./AllwmakeAll > AllwmakeAll_swak.log
```

Проверяем:
команда funkySetFields должна дать такой результат

```bash
/*---------------------------------------------------------------------------*\
  =========                 |
  \\      /  F ield         | OpenFOAM: The Open Source CFD Toolbox
   \\    /   O peration     | Website:  https://openfoam.org
    \\  /    A nd           | Version:  7
     \\/     M anipulation  |
\*---------------------------------------------------------------------------*/
Build  : 7-63349425784a
Exec   : funkySetFields
Date   : Dec 16 2025
Time   : 09:07:11
Host   : "4771b2f4a9d9"
PID    : 95237
I/O    : uncollated
Case   : /home/user/OpenFOAM/swak4Foam
nProcs : 1
sigFpe : Enabling floating point exception trapping (FOAM_SIGFPE).
fileModificationChecking : Monitoring run-time modified files using timeStampMaster (fileModificationSkew 10)
allowSystemOperations : Allowing user-supplied system call operations

// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * //
swakVersion: 202x.yy (Release date: Next release)
// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * //


--> FOAM FATAL ERROR: 
funkySetFields: time/latestTime option is required


    From function main()
    in file funkySetFields.C at line 752.

FOAM exiting
```
&nbsp;

### 8. Устанавливаем решатель rhoReactingCentralFoam 
&nbsp;

rhoReactingCentralFoam - решатель для детонации на OF7. По умолчанию в нем настроена одностадийная кинетика водорода кислорода и азота.

```bash
cd $WM_PROJECT_DIR; cd ..

sudo yum install yum-utils -y
sudo yum-config-manager --add-repo https://cli.github.com/packages/rpm/gh-cli.repo
sudo yum install gh -y

   
gh repo clone duncanam/rhoReactingCentralFoam 
cd rhoReactingCentralFoam/rhoReactingCentralFoam 

sudo yum install unzip -y
wget https://github.com/duncanam/rhoReactingCentralFoam/archive/refs/heads/master.zip
unzip master.zip
mv rhoReactingCentralFoam-master rhoReactingCentralFoam
cd rhoReactingCentralFoam/rhoReactingCentralFoam

./Allwmake >  Allwmake_rhoReactingCentralFoam.log
```

Проверяем командой rhoReactingCentralFoam. Она должна дать следующий результат

```bash
/*---------------------------------------------------------------------------*\
  =========                 |
  \\      /  F ield         | OpenFOAM: The Open Source CFD Toolbox
   \\    /   O peration     | Website:  https://openfoam.org
    \\  /    A nd           | Version:  7
     \\/     M anipulation  |
\*---------------------------------------------------------------------------*/
Build  : 7-63349425784a
Exec   : rhoReactingCentralFoam
Date   : Dec 16 2025
Time   : 09:23:54
Host   : "4771b2f4a9d9"
PID    : 95715
I/O    : uncollated
Case   : /home/user/OpenFOAM/rhoReactingCentralFoam/rhoReactingCentralFoam
nProcs : 1
sigFpe : Enabling floating point exception trapping (FOAM_SIGFPE).
fileModificationChecking : Monitoring run-time modified files using timeStampMaster (fileModificationSkew 10)
allowSystemOperations : Allowing user-supplied system call operations

// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * //
Create time



--> FOAM FATAL ERROR: 
cannot find file "/home/user/OpenFOAM/rhoReactingCentralFoam/rhoReactingCentralFoam/system/controlDict"

    From function virtual Foam::autoPtr<Foam::ISstream> Foam::fileOperations::uncollatedFileOperation::readStream(Foam::regIOobject&, const Foam::fileName&, const Foam::word&, bool) const
    in file global/fileOperations/uncollatedFileOperation/uncollatedFileOperation.C at line 538.

FOAM exiting

```
&nbsp;

### Возможные проблемы:
&nbsp;


У меня была такая ошибка (скорее всего она связана с тем, что у меня centos7 в docker контейнере на arm64)
```bash
/home/user/OpenFOAM/OpenFOAM-7/wmake/rules/linux64Gcc/c++:11: /home/user/OpenFOAM/OpenFOAM-7/wmake/rules/linux64/c++Opt: No such file or directory
make[2]: *** No rule to make target `/home/user/OpenFOAM/OpenFOAM-7/wmake/rules/linux64/c++Opt'.  Stop.
make[2]: *** [/home/user/OpenFOAM/OpenFOAM-7/platforms/linux64GccDPInt32Opt/applications/utilities/preProcessing/foamUpgradeCyclics/sourceFiles] Illegal instruction
wmake error: file '/home/user/OpenFOAM/OpenFOAM-7/platforms/linux64GccDPInt32Opt/applications/utilities/preProcessing/foamUpgradeCyclics/sourceFiles' could not be created in /home/user/OpenFOAM/OpenFOAM-7/applications/utilities/preProcessing/foamUpgradeCyclics
```

Для исправления:
```bash
cd /home/user/OpenFOAM/OpenFOAM-7/wmake/rules
mkdir -p linux64
ln -sf ../linux64Gcc/c linux64/c
ln -sf ../linux64Gcc/c++ linux64/c++
ln -sf ../linux64Gcc/cDebug linux64/cDebug
ln -sf ../linux64Gcc/c++Debug linux64/c++Debug
ln -sf ../linux64Gcc/cOpt linux64/cOpt
ln -sf ../linux64Gcc/c++Opt linux64/c++Opt
ln -sf ../linux64Gcc/cProf linux64/cProf
ln -sf ../linux64Gcc/c++Prof linux64/c++Prof
ln -sf ../linux64Gcc/general linux64/general
```

### Материалы по OpenFOAM:
&nbsp;
Видео-уроки 
https://youtube.com/playlist?list=PLcOe4WUSsMkH6DLHpsYyveaqjKxnEnQqB&si=xUOysuYV7eA90jZs

Руководство пользователя 
https://doc.cfd.direct/openfoam/user-guide-v7/

Шпаргалка по основным командам Linux 
https://cfd.direct/openfoam/linux-guide/

Информация про солвер rhoReactingCentralFoam
https://github.com/duncanam/rhoReactingCentralFoam

