
import React from 'react';
import writeGood from 'write-good';
import { GrammarSuggestion } from './GrammarSuggestion';

// builds array of GrammarSuggestion components from writeGood suggestions
const suggestionContents = (suggestions) => {
  let contents: any = [];
  if (suggestions.length === 0) {
    const golden = { color: 'gold' };
    contents = (
      <div className="grammar_box">
        <p className="grammar_reason"><i style={golden} className="fa fa-star"></i>&nbsp;Nice! No possible improvements were found!</p>
      </div>
    );
  } else {
    suggestions.forEach((suggestion, i) => {
      contents.push(<GrammarSuggestion suggestion={suggestion} key={`suggestion-${i}`} />);
    });
  }
  return contents;
};

interface ICheckGrammarProps {
  toggleGrammar: () => void;
  raw?: string;
}

// takes the place of Rendered in the editor, showing grammar suggestions
export class CheckGrammar extends React.Component<ICheckGrammarProps, any> {
  constructor(props) {
    super(props);
    this.state = {
      suggestions: [],
    };
  }
  public componentDidUpdate(prevProps) {
    if (prevProps.raw !== this.props.raw) {
      const suggestions = writeGood.annotate(this.props.raw, writeGood(this.props.raw));
      this.setState({ suggestions: suggestionContents(suggestions) });
    }
  }

  public componentDidMount() {
    const suggestions = writeGood.annotate(this.props.raw, writeGood(this.props.raw));
    this.setState({ suggestions: suggestionContents(suggestions) });
  }

  public render() {
    const creditStyle = {
      marginTop: '-24px',
    };
    return (<div className="post-content editor_rendered">
      <h2>Writing Suggestions</h2>
      <p style={creditStyle}>Brought to you by <a href="https://github.com/btford/write-good" target="_blank">write-good</a>.</p>
      {this.state.suggestions}
      <button onClick={this.props.toggleGrammar}
        className="pb-button grammar_backToPreview">
        Back to Preview
      </button>
    </div>
    );
  }
}
