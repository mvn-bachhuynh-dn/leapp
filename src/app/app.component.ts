import {Component, OnInit} from '@angular/core';
import {registerLocaleData} from '@angular/common';
import localeEn from '@angular/common/locales/en';
import {TranslateService} from '@ngx-translate/core';
import {environment} from '../environments/environment';
import {ConfigurationService} from './services-system/configuration.service';
import {FileService} from './services-system/file.service';
import {AppService, LoggerLevel} from './services-system/app.service';
import {Router} from '@angular/router';
import {setTheme} from 'ngx-bootstrap';
import {MenuService} from './services/menu.service';
import {TimerService} from './services/timer-service';
import {AccountType} from './models/AccountType';
import * as uuid from 'uuid';
import {WorkspaceService} from './services/workspace.service';
import {SessionService} from './services/session.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  /* Main app file: launches the Angular framework inside Electron app */
  constructor(
    private sessionService: SessionService,
    private workspaceService: WorkspaceService,
    private fileService: FileService,
    private app: AppService,
    private router: Router,
    private menuService: MenuService,
    private timerService: TimerService
  ) {
  }

  ngOnInit() {
    // We get the right moment to set an hook to app close
    const ipc = this.app.getIpcRenderer();
    ipc.on('app-close', () => {
      this.app.logger('Preparing for closing instruction...', LoggerLevel.INFO, this);
      this.beforeCloseInstructions();
    });

    // Use ngx bootstrap 4
    setTheme('bs4');

    if (environment.production) {
      // Clear both info and warn message in production
      // mode without removing them from code actually
      console.warn = () => {};
      console.log = () => {};
    }

    // Prevent Dev Tool to show on production mode
    this.app.blockDevToolInProductionMode();

    // Create or Get the workspace
    const workspace = this.workspaceService.create();

    // All sessions start stopped when app is launched
    if (workspace.sessions.length > 0) {
      workspace.sessions.forEach(sess => this.sessionService.stop(sess.sessionId));
    }

    // Start Global Timer (1s)
    this.timerService.start();

    // Go to initial page if no sessions are already created or
    // go to the list page if is your second visit
    if (workspace.sessions.length > 0) {
      this.router.navigate(['/session-selected']);
    } else {
      this.router.navigate(['/start']);
    }
  }

  /**
   * This is an hook on the closing app to remove credential file and force stop using them
   */
  private beforeCloseInstructions() {
    // TODO: Move to another component
    this.menuService.cleanBeforeExit();
  }
}
