# Laboratory device artwork

Original SVG artwork created for this demo, without third-party images, fonts or remote resources. Transparent backgrounds; all files use viewBox `0 0 128 144`. Front/control edge faces down. Small baked shadows remain within the canvas.

| Registry key (`demoDeviceUrl.js`) | File | Placement |
| --- | --- | --- |
| demo-device-analyzer | analyzer.svg | Bench-top analyzer |
| demo-device-oscilloscope | oscilloscope.svg | Bench-top oscilloscope; screen trace is decorative, not live data |
| demo-device-monitor-terminal | monitor-terminal.svg | Small bench monitoring terminal |
| demo-device-lab-refrigerator | lab-refrigerator.svg | Wall-side cold-storage cabinet |
| demo-device-incubator | incubator.svg | Bench or wall-side incubator |
| demo-device-equipment-rack | equipment-rack.svg | Wall-side instrument rack |

The six-device floor preview places analyzers, oscilloscopes and terminals on benches; refrigerators, incubators and racks line the walls. Its positions remain static art examples, not the shared business layout store. Screen marks and neutral chassis details never represent Mock measurements or alarm state.

These are stylized top-view symbols, not accurate engineering drawings. Minimum suggested display width: 48px; preserve 128:144 aspect ratio. Rotate the entire sprite around its center when placing it.

No device names, readings or alarm indicators are baked in. Task 8B maps registry keys onto shared Mock entities; coordinates/size/rotation come from layout records; status circles overlay independently. Neutral dark screens do not indicate online/offline status.

`preview.html` / `floor-preview.html` remain static art references only — not business routes or Mock data sources. Task 8C enables type:4 layout save via `/map/element/config` with demo-namespace persistence; artwork files themselves stay unchanged.
