GW_LIB=""
for lib in $PWD/Gwion/plug/*/
do GW_LIB="-p$lib $GW_LIB"
done

GW_OPT="--color=always -s44100 -dSndfile"

GWION="$PWD/Gwion/gwion $GW_LIB $GW_OPT"
COLOR="--color=always"

mkdir -p $1
pushd $1

echo "$2" > file.gw
timeout 180s $GWION file.gw 2>&1 |
  bash ../../scripts/ansi2html.sh --body-only > out


[ $(cat out | wc -l) = 0 ] && echo -e '\033[2m(no output)\033[0m' | bash   ../../scripts/ansi2html.sh --body-only > out

[ $(du gwion.wav | cut -f1) -gt 4 ] &&
  ffmpeg -i gwion.wav -preset ultrafast  -b:a 128k output.mp3 gwion.mp3
exit 0