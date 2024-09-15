import { Component, OnInit } from '@angular/core';
import { Foto } from '../interfaces/foto';
import { ImageService } from '../services/image.service';
import { IonCol, IonRow, IonContent, IonHeader, IonToolbar, IonTitle, IonIcon, IonButtons, IonButton } from "@ionic/angular/standalone";
import { CommonModule } from '@angular/common';
import { NgxEchartsDirective, NgxEchartsModule, ThemeOption, provideEcharts } from 'ngx-echarts';
import { ECharts, EChartsOption } from 'echarts';
import { addIcons } from 'ionicons';
import { arrowBackCircleOutline } from 'ionicons/icons';
import { Route, Router } from '@angular/router';

@Component({
  selector: 'app-resultados',
  templateUrl: './resultados.component.html',
  styleUrls: ['./resultados.component.scss'],
  standalone: true,
  imports: [IonButton, IonButtons, IonIcon, IonTitle, IonToolbar, IonHeader, IonContent, IonRow, IonCol, CommonModule, NgxEchartsDirective, NgxEchartsModule],
  providers: [
    provideEcharts(),
  ]
})
export class ResultadosComponent  implements OnInit {

  coolTheme = {
    color: [
      '#b21ab4',
      '#6f0099',
      '#2a2073',
      '#0b5ea8',
      '#17aecc',
      '#b3b3ff',
      '#eb99ff',
      '#fae6ff',
      '#e6f2ff',
      '#eeeeee',
    ],

    title: {
      fontWeight: 'normal',
      color: 'white',
    },

    visualMap: {
      color: ['#00aecd', '#a2d4e6'],
    },

    toolbox: {
      color: ['#00aecd', '#00aecd', '#00aecd', '#00aecd'],
    },

    tooltip: {
      backgroundColor: 'rgba(0,0,0,0.5)',
      axisPointer: {
        type: 'line', 
        lineStyle: {
          color: '#00aecd',
          type: 'dashed',
        },
        crossStyle: {
          color: '#00aecd',
        },
        shadowStyle: {
          color: 'rgba(200,200,200,0.3)',
        },
      },
    },

    dataZoom: {
      dataBackgroundColor: '#eee', 
      fillerColor: 'rgba(144,197,237,0.2)', 
      handleColor: '#00aecd', 
    },

    timeline: {
      lineStyle: {
        color: '#00aecd',
      },
      controlStyle: {
        color: '#00aecd',
        borderColor: '00aecd',
      },
    },

    candlestick: {
      itemStyle: {
        color: '#00aecd',
        color0: '#a2d4e6',
      },
      lineStyle: {
        width: 1,
        color: '#00aecd',
        color0: '#a2d4e6',
      },
      areaStyle: {
        color: '#b21ab4',
        color0: '#0b5ea8',
      },
    },

    chord: {
      padding: 4,
      itemStyle: {
        color: 'white',
        borderWidth: 1,
        borderColor: 'rgba(128, 128, 128, 0.5)',
      },
      lineStyle: {
        color: 'rgba(128, 128, 128, 0.5)',
      },
      areaStyle: {
        color: '#0b5ea8',
      },
    },

    graph: {
      itemStyle: {
        color: '#b21ab4',
      },
      linkStyle: {
        color: '#2a2073',
      },
    },

    map: {
      itemStyle: {
        color: '#c12e34',
      },
      areaStyle: {
        color: '#ddd',
      },
      label: {
        color: '#c12e34',
      },
    },

    gauge: {
      axisLine: {
        lineStyle: {
          color: [
            [0.2, '#dddddd'],
            [0.8, '#00aecd'],
            [1, '#f5ccff'],
          ],
          width: 8,
        },
      },
    },
  };

  initOptsFeas = {
    renderer: 'svg',
    width: 300,
    height: 300,
  };

  optionsFeas!: EChartsOption;

  theme!: string | ThemeOption;
  optionsLindas!: EChartsOption;

  public fotosFeas: Foto[] = [];
  public fotosLindas: Foto[] = [];
  public xF: any[] = [];
  public xL: any[] = [];

  constructor(private imageService: ImageService, private router : Router) { addIcons({arrowBackCircleOutline})}

  ngOnInit(): void {
    this.fotosFeas = [];
    this.fotosLindas = [];
    this.imageService.traer()
      .subscribe(fotos => {
        fotos.forEach(f => {
          if (f.tipo == "fea") {
            this.fotosFeas.push(f);
          } else {
            this.fotosLindas.push(f);
          }
        });

        const yL: any = [];
        const seriesLindas: any = [];
        this.fotosLindas.forEach(f => {
          this.xL.push(`<img src="{f.url}" alt="{f.id}" style="width: 100%;">`);
          yL.push(this.contabilizarFoto(f));
          seriesLindas.push(
            { value: this.contabilizarFoto(f), name: f.url, label: { show: false }, labelLine: { show: false } }
          );
          this.optionsLindas = {
            backgroundColor: 'hsla(262, 30%, 30%, 0.8)',
            title: {
              left: '50%',
              text: 'Lindas',
              textAlign: 'center',
              textStyle: {
                color: 'white'
              }
            },
            tooltip: {
              confine: true,
              trigger: 'item',
              formatter: '<div style="width: 9.5rem;"> {a}: {c} <br>  <img src="{b}" alt="foto"></div>',
            },
            calculable: true,
            series: [
              {
                name: 'Votos',
                type: 'pie',
                radius: ['20%', '70%'],
                roseType: 'radius',
                data: seriesLindas,
              },
            ],
          };
        });

        const xF: any[] = [];
        const yF: any[] = [];
        const series: any = [];
        this.fotosFeas.forEach(f => {
          if (f.votes.length > 0) {
            this.xF.push(f.url);
            series.push(
              { value: this.contabilizarFoto(f), name: f.url }
            );
            yF.push(this.contabilizarFoto(f))
          }
        });
        this.optionsFeas = {
          backgroundColor: 'hsla(262, 30%, 30%, 0.8)',
          title: {
            left: '50%',
            text: 'Feas',
            textAlign: 'center',
            textStyle: {
              color: 'white'
            }
          },
          color: ['#3398DB'],
          tooltip: {
            confine: true,
            trigger: 'item',
            formatter: '<div style="width: 9.5rem;"> {a}: {c} <br>  <img src="{b}" alt="foto"></div>',
            axisPointer: {
              type: 'shadow',
            },
          },
          grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true,
          },
          xAxis: [
            {
              type: 'category',
              data: xF,
              axisTick: {
                alignWithLabel: true,
              },
            },
          ],
          yAxis: [
            {
              type: 'value',
              axisLabel: {
                color: 'white'
              }
            },
          ],
          series: [
            {
              name: 'Votos',
              type: 'bar',
              barWidth: '60%',
              data: series,
            },
          ],
        };
      });
  }

  contabilizarFoto(photo: Foto) {
    return photo.votes.length;
  }

  back(){
    this.router.navigate(['tabs/tab2']);
  }
}
