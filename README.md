# Cut-paper documentary v2 (Remotion)

155 short shots (about 20 minutes at the default timings), each with a different scene, camera move and
time of day. Nothing holds for more than about 9 seconds, and every shot has moving parts: walking,
gesturing characters, parallax layers, water, fire, birds, dust and paper-wipe transitions between shots.

## Setup (once)
    npm install

## See it
    npm start                 # Remotion Studio: pick any shot (C1-01 ... C8-18) or "Film" in the left list
    npm run sheet             # one preview still per shot into out/stills (open out/stills/index.html)
    npm run shotlist          # rewrites SHOTLIST.md (shot id, length, camera, narration cue)

## Render (FHD 1920x1080, 30 fps)
    npm run render:clips      # RECOMMENDED for editing: every shot as its own clip in out/clips
                              # resumable: if you stop it, run it again and it skips finished clips
    npm run render:clips -- --only C3-11,C3-12      # just some shots
    npm run render:clips -- --from C4-01            # from a shot onward
    npm run render                                  # the whole film in one file (out/film.mp4)
    npm run render:audio                            # whole film with public/narration.mp3 mixed in

Rendering is heavy (layered, blurred, shadowed paper at 1080p). If it is slow or runs out of memory,
render clips instead of the whole film, close other apps, and try adding `--concurrency=2` (or 1).

## Render for free on GitHub (no load on your laptop)
1. Create a GitHub repository (public repos get the most free minutes) and push this folder:
       git init && git add . && git commit -m "documentary" && git branch -M main
       git remote add origin https://github.com/YOUR-NAME/YOUR-REPO.git && git push -u origin main
2. On GitHub open the **Actions** tab, choose **Render clips**, click **Run workflow**, pick the chapters.
3. Each chapter renders in its own job. When a job finishes, download its zip (`clips-chapter-N`) from the
   run page (kept for 7 days). Unzip all of them into one folder and edit as usual.
Re-run with fewer chapters (for example `3,5`) to redo just those. Check GitHub's current free-minute limits.

## Your workflow
1. Record the voiceover. Open SHOTLIST.md: the "Cue" column says what each shot illustrates.
2. In `src/timeline.ts`, change a shot's seconds (the number after the id) to match your recording.
   Or just trim the rendered clips in your editor.
3. Shots marked ADD YOUR IMAGE (13 of them) are paper-frame placeholders for your historical images.
   Drop your picture over them in the editor. `npm run render:clips` hides the placeholder text if you
   pass `--no-slot-text` (see scripts) or set slotText false in props-audio.json.
4. Optional paper labels: `npm run render:clips -- --labels` adds the short on-screen label of each shot.

## Where things are
- `src/timeline.ts`   the shot list. Each line is one shot: id, seconds, time of day, camera, scene.
- `src/shots/recipes.ts`   ready-made backgrounds (river, city, hall, camp, Egypt, China, Andes...).
- `src/shots/special.tsx`, `special2.tsx`   hand-built scenes: ratchet, four-lock door, family tree, maps...
- `src/engine/`   camera and parallax planes, jointed paper characters (puppet.tsx), set pieces (env.tsx).

## Honest notes
- I previewed a still of every shot and test-rendered a short clip, but I have not rendered the full film.
- All characters are cut-paper silhouettes (the composite leader is red). Faces are not drawn, by design.
- Real people (Puyi, Yuan Shikai) are never depicted with faces. Use your archive images for those.
