GW_LIB=""
for lib in $PWD/Gwion/plug/*/
do GW_LIB="-p$lib $GW_LIB"
done
echo "$GW_LIB"
GWION="$PWD/Gwion/gwion $GW_LIB"


mkdir -p $1
pushd $1

echo "$2" > file.gw
timeout 180s $GWION -dSndfile file.gw &> out
ffmpeg -i gwion.wav gwion.mp3
#rm gwion.wav