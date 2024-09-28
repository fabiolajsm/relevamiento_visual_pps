import { Component, OnInit } from '@angular/core';
import { Foto } from '../interfaces/foto';
import { ImageService } from '../services/image.service';
import {
  IonCol,
  IonRow,
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonIcon,
  IonButtons,
  IonButton,
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import {
  NgxEchartsDirective,
  NgxEchartsModule,
  ThemeOption,
  provideEcharts,
} from 'ngx-echarts';
import { EChartsOption } from 'echarts';
import { addIcons } from 'ionicons';
import { arrowBackCircleOutline } from 'ionicons/icons';
import { Router } from '@angular/router';

@Component({
  selector: 'app-results',
  templateUrl: './results.component.html',
  styleUrls: ['./results.component.scss'],
  standalone: true,
  imports: [
    IonButton,
    IonButtons,
    IonIcon,
    IonTitle,
    IonToolbar,
    IonHeader,
    IonContent,
    IonRow,
    IonCol,
    CommonModule,
    NgxEchartsDirective,
    NgxEchartsModule,
  ],
  providers: [provideEcharts()],
})
export class ResultsComponent implements OnInit {
  initOpts = {
    renderer: 'svg',
    width: 300,
    height: 300,
  };

  optionsFeas!: EChartsOption; // Opciones para la gráfica de "feas"
  optionsLindas!: EChartsOption; // Opciones para la gráfica de "lindas"
  theme!: string | ThemeOption;

  public fotosFeas: Foto[] = [];
  public fotosLindas: Foto[] = [];

  constructor(private imageService: ImageService, private router: Router) {
    addIcons({ arrowBackCircleOutline });
  }

  ngOnInit(): void {
    this.imageService.traer().subscribe((fotos) => {
      fotos.forEach((f) => {
        if (f.tipo === 'fea') {
          this.fotosFeas.push(f);
        } else {
          this.fotosLindas.push(f);
        }
      });

      console.log(this.fotosFeas, 'feas');

      this.prepareChartData(this.fotosLindas, 'Lindas', 'optionsLindas');
      this.prepareChartData(this.fotosFeas, 'Feas', 'optionsFeas');
    });
  }

  prepareChartData(
    fotos: Foto[],
    title: string,
    optionVar: 'optionsLindas' | 'optionsFeas'
  ) {
    const series: any = [];

    fotos.forEach((f) => {
      if (f.votes.length > 0) {
        series.push({
          value: this.contabilizarFoto(f),
          name: f.url,
          label: { show: false },
          labelLine: { show: false },
        });
      }
    });

    this[optionVar] = {
      backgroundColor: 'hsla(262, 30%, 30%, 0.8)',
      title: {
        left: 'center',
        text: title,
        textStyle: { color: '#d9d9d9' },
      },
      tooltip: {
        confine: true,
        trigger: 'item',
        formatter:
          '<div style="width: 9.5rem;"> {a}: {c} <br> <img src="{b}" alt="foto"></div>',
      },
      series: [
        {
          name: 'Votos',
          type: 'pie',
          radius: ['20%', '70%'],
          roseType: 'radius',
          data: series,
        },
      ],
    };
  }

  contabilizarFoto(photo: Foto) {
    return photo.votes.length;
  }

  back() {
    this.router.navigate(['tabs/tab2']);
  }
}
