GW_LIB=""
for lib in $PWD/Gwion/plug/*/
do GW_LIB="-p$lib $GW_LIB"
done
echo "$GW_LIB"
GWION="$PWD/Gwion/gwion $GW_LIB"
COLOR="--color=always"

mkdir -p $1
pushd $1

echo "$2" > file.gw
#timeout 180s $GWION -s44100 -dSndfile file.gw &> out
timeout 180s $GWION --color=always -s44100 -dSndfile file.gw 2>&1 |
  bash ../../ansi2html.sh --bg=dark --body-only > out

[ $(du gwion.wav | cut -f1) -gt 4 ] &&
  ffmpeg -i gwion.wav -preset ultrafast  -b:a 128k output.mp3 gwion.mp3
exit 0