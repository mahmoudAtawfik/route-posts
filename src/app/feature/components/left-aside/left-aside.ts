import { Component, input, output, signal } from '@angular/core';
import { NgClass } from '@angular/common';
import { FeedTab } from '../feed/feed';

@Component({
  selector: 'app-left-aside',
  imports: [NgClass],
  templateUrl: './left-aside.html',
  styleUrl: './left-aside.css',
})
export class LeftAside {
  readonly activeTab = input<FeedTab>('feed');

  readonly tabChanged = output<FeedTab>();

  readonly baseClasses = 'flex w-full items-center justify-center xl:justify-start gap-2.5 rounded-xl px-3 py-2.5 text-center xl:text-left text-sm font-bold transition cursor-pointer';

  readonly activeClasses = `${this.baseClasses} bg-[#e7f3ff] text-[#1877f2] dark:bg-blue-900/40 dark:text-blue-400`;
  
  readonly inactiveClasses = `${this.baseClasses} text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800`;

  selectTab(tab: FeedTab): void {
    this.tabChanged.emit(tab);
  }
}