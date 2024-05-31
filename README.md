# Blackjack Card Game

## プロジェクトの概要
このプロジェクトはブラックジャックが遊べるトランプカードゲームです。TypeScriptの型付けOOPとMVCアーキテクチャを使用しています。

## 使用技術
- **言語**: TypeScript
- **アーキテクチャ**: MVC (Model-View-Controller)

## ファイル構成
- **src**: フロントエンドおよびゲームロジックのコードリソースが含まれています。
  - `Card.ts`
  - `CardGameView.ts`
  - `Controller.ts`
  - `Deck.ts`
  - `GameDecision.ts`
  - `Player.ts`
  - `Table.ts`
  - `testFile.ts`

## アプリケーションの詳細
- **モデル部分**: `Table`と`Player`に対してインターフェースによる構造化を付与しています。
- **コントローラー部分**: 動的バインディングを使用しています。`Table`にはゲームルールとしてフェーズが存在するという観点で、インターフェースを実装しています。

## 開発予定
- **インターフェースの拡張**: ディーラーとの勝負がない、フェーズが存在しない、ターンが存在しないなどの観点でインターフェースを拡張および継承して、より複雑な構造を付与する予定です。
- **ジェネリクスとデコレータの使用**: コードの可用性と可読性の向上を図ります。

## セットアップ手順
1. リポジトリをクローンする
   ```sh
   git clone https://github.com/shinshinbushimon/PlayingCardsProject.git
