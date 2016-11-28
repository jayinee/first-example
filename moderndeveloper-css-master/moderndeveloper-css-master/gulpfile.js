var path = require('path');
var gulp = require('gulp');
var bs = require('browser-sync');
var sass = require('gulp-sass');
var postcss = require('gulp-postcss');
var autoprefixer = require('autoprefixer');
var minimist = require('minimist');
var es = require('event-stream');
var cssnano = require('gulp-cssnano');
var perfectionist = require('perfectionist');

var opts = {
    string: ['project'],
    alias: {
        p: 'project',
    },
};

var args = minimist(process.argv.slice(2), opts);

var pa1 = path.join(process.cwd(), 'project-assignment-1');
var pa2 = path.join(process.cwd(), 'project-assignment-2');
var pa3 = path.join(process.cwd(), 'project-assignment-3');
var pa4 = path.join(process.cwd(), 'project-assignment-4');
var pa5 = path.join(process.cwd(), 'project-assignment-5');
var pa6 = path.join(process.cwd(), 'project-assignment-6');
var dist = path.join(process.cwd(), 'dist');
// var pa = path.join(process.cwd(), 'team-pa');

var projectPath;
var port;

switch (args.project) {
    case '2':
        projectPath = pa2;
        port = 5002;
        break;
    case '3':
        projectPath = pa3;
        port = 5003;
        break;
    case '4':
        projectPath = pa4;
        port = 5004;
        break;
    case '5':
        projectPath = pa5;
        port = 5005;
        break;
    case '6':
        projectPath = pa6;
        port = 5006;
        break;
    case 'dist':
        projectPath = dist;
        port = 5007;
        break;
    default:
        projectPath = pa1;
        port = 5001;
}

gulp.task('bs', ['sass'], function () {
    bs.init({
        server: {
            baseDir: projectPath,
        },
        port: port,
    });
});

gulp.task('sass', function () {
    return gulp.src(path.join(projectPath, 'sass/*.sass'))
        .pipe(sass().on('error', sass.logError))
        .pipe(postcss([autoprefixer({ browsers: ['last 2 versions'] })]))
        .pipe(cssnano())
        .pipe(postcss([perfectionist()]))
        .pipe(gulp.dest(path.join(projectPath, 'css')))
        .pipe(bs.reload({ stream: true }));
});

gulp.task('default', ['bs'], function () {
    gulp.watch(path.join(projectPath, 'sass/*.sass'), ['sass']);
    gulp.watch(path.join(projectPath, 'js/*.js')).on('change', bs.reload);
    gulp.watch(path.join(projectPath, 'index.html')).on('change', bs.reload);
});

// BUILD
var projects = [pa1, pa2, pa3, pa4, pa5, pa6];

gulp.task('build', function () {
    return es.merge(projects.map(function (i) {
        return gulp.src(path.join(i, 'sass/*.sass'))
        .pipe(sass().on('error', sass.logError))
        .pipe(postcss([autoprefixer({ browsers: ['last 2 versions'] })]))
        .pipe(cssnano())
        .pipe(postcss([perfectionist()]))
        .pipe(gulp.dest(path.join(i, 'css')));
    }));
});

// gulp.task('pa', function () {
//     return gulp.src(path.join(pa, '*.scss'))
//         .pipe(sass().on('error', sass.logError))
//         .pipe(postcss([autoprefixer({ browsers: ['last 2 versions'] })]))
//         .pipe(purify([path.join(pa, 'index.html')], {
//             info: true,
//             rejected: true,
//         }))
//         .pipe(cssnano())
//         .pipe(gulp.dest(path.join(pa, 'css')));
// });
